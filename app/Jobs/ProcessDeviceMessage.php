<?php

namespace App\Jobs;

use App\Enum\MessageFields;
use App\Events\NewDeviceDataPoint;
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
    public function __construct(public DeviceMessage $message)
    {
    }

    protected function applyProcessingSteps($rawValue, array $steps): mixed
    {
        $currentValue = $rawValue;

        if (is_string($currentValue)) {
            $currentValue = str_replace("\0", "", $currentValue);
        }

        foreach ($steps as $step) {
            $operation = $step['operation'] ?? null;
            try {
                switch ($operation) {
                    case 'CAST_TO_INTEGER':
                        $currentValue = intval($currentValue);
                        break;
                    case 'CAST_TO_FLOAT':
                        $currentValue = floatval(str_replace(',', '.', (string) $currentValue));
                        break;
                    case 'CAST_TO_BOOLEAN':
                        $trueValues = array_map('strtolower', $step['true_values'] ?? ['1', 'true', 'on']);
                        $currentValue = in_array(strtolower((string) $currentValue), $trueValues);
                        break;
                    case 'DECODE_HEX':
                        $currentValue = hexdec((string) $currentValue);
                        break;
                    case 'MULTIPLY_BY':
                        $currentValue = floatval($currentValue) * ($step['factor'] ?? 1);
                        break;
                    case 'DIVIDE_BY':
                        $divisor = $step['divisor'] ?? 1;
                        $currentValue = $divisor != 0 ? floatval($currentValue) / $divisor : null;
                        break;
                    case 'STRING_REPLACE':
                        $currentValue = str_replace($step['search'] ?? '', $step['replace'] ?? '', (string) $currentValue);
                        break;
                    default:
                        Log::warning("Unknown processing step operation in ProcessDeviceMessage", ['operation' => $operation, 'message_id' => $this->message->id]);
                }
            } catch (Throwable $e) {
                Log::error("Error applying processing step '{$operation}' in ProcessDeviceMessage", [
                    'message_id' => $this->message->id,
                    'raw_value' => $rawValue,
                    'current_step_value' => $currentValue, // Value before this step failed (or during)
                    'step' => $step,
                    'error' => $e->getMessage()
                ]);
                return null; // Skip this data point if a step errors
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
            'data_point_types',
            now()->addHours(24),
            function () {
                return DataPointType::all();
            }
        );

        $insertDataPoints = [];
        try {
            foreach ($this->message->message['fields'] as $fieldKey => $rawValue) {
                $dataPointTypeId = intval($fieldKey);

                $dataPointType = $dataPointTypes->firstWhere('id', $dataPointTypeId);

                if (!$dataPointType) {
                    continue;
                }

                $processedValue = $this->applyProcessingSteps($rawValue, $dataPointType->processing_steps);

                if ($processedValue === null && $rawValue !== null) {
                    continue;
                }

                $insertDataPoints[] = DeviceDataPoint::create([
                    'device_message_id' => $this->message->id,
                    'device_id' => $device->id,
                    'vehicle_id' => $vehicleId,
                    'data_point_type_id' => $dataPointType->id,
                    'value' => $processedValue,
                    'recorded_at' => $recordedAt,
                ]);
            }

            if (!empty($insertDataPoints)) {
                event(new NewDeviceDataPoint($insertDataPoints));
            }

            $device->last_contact_at = $recordedAt;
            $device->save();

            $this->message->processed_at = now();
            $this->message->save();
        } catch (Throwable $e) {
            Log::error('Error processing device message', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
