<?php

namespace App\Jobs;

use App\Enum\DataPointDataType;
use App\Enum\MessageFields;
use App\Events\DeviceMessageProcessed;
use App\Helpers\GeoHelper;
use App\Models\DataPointType;
use App\Models\DeviceDataPoint;
use App\Models\DeviceMessage;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessDeviceMessage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public DeviceMessage $message) {}

    /**
     * Apply additional transformations to the raw value based on processing steps.
     * This method is specific to ProcessDeviceMessage for atomic types.
     */
    protected function applyAdditionalTransformations(mixed $currentValue, ?array $steps, string $dataPointTypeNameForLog): mixed
    {
        if (empty($steps)) {
            return $currentValue;
        }

        foreach ($steps as $step) {
            $operation = $step['operation'] ?? null;
            switch ($operation) {
                case 'DECODE_HEX':
                    $currentValue = is_string($currentValue) ? hexdec($currentValue) : null;
                    break;
                case 'MULTIPLY_BY':
                    $factor = $step['factor'] ?? ($step['multiplier'] ?? 1);
                    $currentValue = (is_numeric($currentValue) && is_numeric($factor)) ? (floatval($currentValue) * floatval($factor)) : null;
                    break;
                case 'DIVIDE_BY':
                    $divisor = $step['divisor'] ?? 1;
                    $currentValue = (is_numeric($currentValue) && is_numeric($divisor) && floatval($divisor) != 0) ? (floatval($currentValue) / floatval($divisor)) : null;
                    break;
                case 'STRING_REPLACE':
                    $search = $step['search'] ?? '';
                    $replace = $step['replace'] ?? '';
                    $currentValue = is_string($currentValue) ? str_replace($search, $replace, (string) $currentValue) : null;
                    break;
                default:
                    Log::debug("Unknown operation '{$operation}' for DataPointType '{$dataPointTypeNameForLog}' in ProcessDeviceMessage applyAdditionalTransformations", [
                        'message_id' => $this->message->id
                    ]);
                    break;
            }
        }
        return $currentValue;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->message->processed_at !== null) {
            return;
        }

        if (!isset($this->message->message['fields']) || !is_array($this->message->message['fields'])) {
            $this->message->processed_at = now();
            $this->message->save();
            return;
        }

        $recordedAt = Carbon::parse($this->message->message['messageTimeUtc'] ?? $this->message->created_at, 'UTC')
            ->tz(config('app.timezone'));

        $device = $this->message->device;
        $vehicleId = $device->vehicle_id;

        $dataPointTypes = Cache::remember(
            'data_point_types_all_keyed_by_id',
            now()->addHours(24),
            fn() => DataPointType::all()->keyBy('id')
        );

        $insertDataPoints = [];

        try {
            foreach ($this->message->message['fields'] as $fieldKey => $rawValue) {
                $dataPointTypeId = intval($fieldKey);
                $dataPointType = $dataPointTypes->get($dataPointTypeId);

                if (!$dataPointType) {
                    Log::warning("DataPointType not found for ID {$dataPointTypeId} in ProcessDeviceMessage", ['message_id' => $this->message->id]);
                    continue;
                }

                if ($dataPointType->category === 'COMPOSITE') {
                    continue;
                }

                $processedValue = null;
                $cleanRawValue = is_string($rawValue) ? str_replace("\0", "", $rawValue) : $rawValue;

                switch ($dataPointType->type) {
                    case DataPointDataType::INTEGER:
                        $processedValue = intval($cleanRawValue);
                        break;
                    case DataPointDataType::FLOAT:
                        $processedValue = floatval(str_replace(',', '.', (string) $cleanRawValue));
                        break;
                    case DataPointDataType::BOOLEAN:
                        $trueValues = ['1', 'true', 'on', 1, true];
                        $processedValue = in_array(strtolower((string) $cleanRawValue), array_map('strtolower', $trueValues), true);
                        break;
                    case DataPointDataType::JSON:
                        $processedValue = $cleanRawValue;
                        break;
                    case DataPointDataType::STRING:
                        $processedValue = (string) $cleanRawValue;
                        break;
                    case DataPointDataType::RAW:
                    default:
                        $processedValue = $cleanRawValue;
                        break;
                }

                if ($processedValue !== null && !empty($dataPointType->processing_steps)) {
                    $processedValue = $this->applyAdditionalTransformations($processedValue, $dataPointType->processing_steps, $dataPointType->name);
                }

                if ($processedValue === null && $cleanRawValue !== null && !empty($dataPointType->processing_steps)) {
                    continue;
                }

                $insertDataPoints[] = [
                    'device_message_id' => $this->message->id,
                    'device_id' => $device->id,
                    'vehicle_id' => $vehicleId,
                    'data_point_type_id' => $dataPointType->id,
                    'value' => json_encode($processedValue),
                    'recorded_at' => $recordedAt,
                ];
            }

            DB::transaction(function () use (&$insertDataPoints, $recordedAt, $device) {

                DeviceDataPoint::insert($insertDataPoints);

                $device->last_contact_at = $recordedAt;
                $device->save();

                $this->message->processed_at = now();
                $this->message->save();
            });

            if (!empty($insertDataPoints)) {
                event(new DeviceMessageProcessed($this->message));
            }
        } catch (Throwable $e) {
            Log::error('Error processing device message batch', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
