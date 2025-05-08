<?php

namespace App\Services;

use App\Models\DataPointType;
use App\Models\Device;
use App\Models\DeviceDataPoint;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class DeviceTelemetryService
{
    protected const CACHE_TTL = 60 * 60 * 24; // Cache Time-To-Live in seconds (1 day)

    /**
     * Get the latest data point reading for a specific device and data point type.
     *
     * @param Device $device
     * @param int $dataPointTypeId The integer ID of the DataPointType
     * @return mixed The value of the latest data point, or null if not found.
     */
    public function getLatestReading(Device $device, int $dataPointTypeId): mixed
    {
        $dataPointType = $this->resolveDataPointType($dataPointTypeId);
        if (!$dataPointType) {
            return null;
        }

        $cacheKey = "device_telemetry:{$device->id}:latest:{$dataPointType->id}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($device, $dataPointType) {
            if ($dataPointType->category === 'ATOMIC') {
                $reading = DeviceDataPoint::where('device_id', $device->id)
                    ->where('data_point_type_id', $dataPointType->id)
                    ->orderByDesc('recorded_at')
                    ->first();
                return $reading ? $reading->value : null;
            } elseif ($dataPointType->category === 'COMPOSITE') {
                return $this->calculateCompositeValue($device, $dataPointType);
            }
            return null;
        });
    }

    /**
     * Get data point readings for a specific device, type, and period.
     *
     * @param Device $device
     * @param int $dataPointTypeId
     * @param Carbon $startTime
     * @param Carbon $endTime
     * @return \Illuminate\Support\Collection
     */
    public function getReadingsForPeriod(Device $device, int $dataPointTypeId, Carbon $startTime, Carbon $endTime): \Illuminate\Support\Collection
    {
        $dataPointType = $this->resolveDataPointType($dataPointTypeId);
        if (!$dataPointType || $dataPointType->category === 'COMPOSITE') {
            Log::warning('Period queries for COMPOSITE types are not yet fully supported directly via getReadingsForPeriod.', [
                'type_id' => $dataPointType?->id,
                'device_id' => $device->id
            ]);
            return collect();
        }

        return DeviceDataPoint::where('device_id', $device->id)
            ->where('data_point_type_id', $dataPointType->id)
            ->whereBetween('recorded_at', [$startTime, $endTime])
            ->orderBy('recorded_at')
            ->get([
                'value',
                'recorded_at'
            ]);
    }

    /**
     * Get aggregated data for a specific device, type, and period.
     * Example: Average speed over the last 24 hours.
     *
     * @param Device $device
     * @param int $dataPointTypeId
     * @param string $aggregationFunction (e.g., AVG, SUM, COUNT, MIN, MAX)
     * @param Carbon $startTime
     * @param Carbon $endTime
     * @param string|null $timeBucket (e.g., 'hour', 'day') - for grouping by time intervals
     * @return array
     */
    public function getAggregatedReadings(
        Device $device,
        int $dataPointTypeId,
        string $aggregationFunction,
        Carbon $startTime,
        Carbon $endTime,
        ?string $timeBucket = null
    ) {
        $dataPointType = $this->resolveDataPointType($dataPointTypeId);
        if (!$dataPointType || $dataPointType->category === 'COMPOSITE') {
            Log::warning('Aggregation queries for COMPOSITE types are not yet supported directly.', [
                'type_id' => $dataPointType?->id,
                'device_id' => $device->id
            ]);
            return [];
        }

        $query = DeviceDataPoint::where('device_id', $device->id)
            ->where('data_point_type_id', $dataPointType->id)
            ->whereBetween('recorded_at', [$startTime, $endTime]);

        $allowedAggregations = ['avg', 'sum', 'count', 'min', 'max'];
        $safeAggregationFunction = strtolower($aggregationFunction);
        if (!in_array($safeAggregationFunction, $allowedAggregations)) {
            Log::error('Invalid aggregation function requested.', ['function' => $aggregationFunction, 'device_id' => $device->id]);
            return [];
        }

        if ($timeBucket) {
            $safeTimeBucket = strtolower($timeBucket);
            $dateTruncExpression = match ($safeTimeBucket) {
                'hour' => "DATE_TRUNC('hour', recorded_at)",
                'day' => "DATE_TRUNC('day', recorded_at)",
                default => null,
            };

            if (!$dateTruncExpression) {
                Log::error('Invalid time bucket for aggregation.', ['bucket' => $timeBucket, 'device_id' => $device->id]);
                return [];
            }

            // Use a direct string for the numeric cast instead of interpolating DB::raw object
            $numericCastSql = "(value#>>'{}')::numeric";
            
            // Return data as array of objects with value and recorded_at properties instead of key-value pairs
            $rawAggregatedData = $query->selectRaw("{$dateTruncExpression} as time_group, {$safeAggregationFunction}({$numericCastSql}) as aggregate_value")
                ->groupBy('time_group')
                ->orderBy('time_group')
                ->get();
                
            // Transform to the expected format
            return $rawAggregatedData->map(function($item) {
                return [
                    'value' => (float) $item->aggregate_value,
                    'recorded_at' => $item->time_group
                ];
            })->values()->all();
        } else {
            // For non-grouped aggregations:
            // Update to use the raw SQL string directly for aggregate functions
            $numericCastSql = "(value#>>'{}')::numeric";
            
            // For non-grouped aggregations, just return a single item with the current time
            $result = null;
            switch ($safeAggregationFunction) {
                case 'count':
                    $result = $query->count();
                    break;
                case 'avg':
                case 'sum':
                case 'min':
                case 'max':
                    $result = DB::select("SELECT {$safeAggregationFunction}({$numericCastSql}) as result FROM ({$query->toSql()}) as subquery", $query->getBindings())[0]->result ?? 0;
                    break;
                default:
                    return []; // Should be caught by allowedAggregations
            }
            
            // Return as array of objects format (single item)
            return [
                [
                    'value' => (float) $result,
                    'recorded_at' => now()->toISOString()
                ]
            ];
        }
    }

    /**
     * Resolves DataPointType from ID.
     */
    protected function resolveDataPointType(int $id): ?DataPointType
    {
        return DataPointType::find($id);
    }

    /**
     * Calculates the value for a COMPOSITE DataPointType.
     */
    protected function calculateCompositeValue(Device $device, DataPointType $compositeType): mixed
    {
        if ($compositeType->category !== 'COMPOSITE' || empty($compositeType->processing_steps)) {
            return null;
        }

        $processingSteps = $compositeType->processing_steps;
        $currentValue = null;
        $sourceValueAcquired = false; 
        try {
            foreach ($processingSteps as $step) {
                $logic = $step['logic'] ?? ($step['operation'] ?? null); 
                switch ($logic) {
                    case 'GET_LATEST_FROM_SOURCE':
                        if (isset($step['source_data_point_type_id'])) {
                            $currentValue = $this->getLatestReading($device, $step['source_data_point_type_id']);
                            $sourceValueAcquired = true;
                        } else {
                            Log::warning('GET_LATEST_FROM_SOURCE step missing source_data_point_type_id', [
                                'composite_type_id' => $compositeType->id,
                                'device_id' => $device->id
                            ]);
                            return null;
                        }
                        continue; // Move to next step after acquiring source

                    case 'PRIORITY_PICK':
                        if (isset($step['sources']) && is_array($step['sources'])) {
                            $sortedSources = collect($step['sources'])->sortBy('priority')->values()->all();
                            foreach ($sortedSources as $sourceConfig) {
                                if (!isset($sourceConfig['data_point_type_id'])) continue;
                                $sourceValue = $this->getLatestReading($device, $sourceConfig['data_point_type_id']);
                                if ($sourceValue !== null) {
                                    $currentValue = $sourceValue;
                                    $sourceValueAcquired = true;
                                    break;
                                }
                            }
                            if (!$sourceValueAcquired) $currentValue = null; // No source found from priority pick
                        } else {
                            Log::warning('PRIORITY_PICK step missing or invalid sources array', [
                                'composite_type_id' => $compositeType->id,
                                'device_id' => $device->id
                            ]);
                            return null;
                        }
                        continue;
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
                        $currentValue = is_string($currentValue) ? str_replace($search, $replace, $currentValue) : null;
                        break;
                    default:
                        break;
                }
            }
        } catch (Throwable $e) {
            Log::error('Error calculating composite value for DeviceTelemetryService', [
                'device_id' => $device->id,
                'composite_type_id' => $compositeType->id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(), // Limit trace in production if too verbose
            ]);
            return null;
        }
        return $currentValue;
    }
}
