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
    public function getReadingsForPeriod(Device $device, int $dataPointTypeId, Carbon $startTime, Carbon $endTime):
    \Illuminate\Support\Collection
    {
        $dataPointType = $this->resolveDataPointType($dataPointTypeId);
        if (!$dataPointType || $dataPointType->category === 'COMPOSITE') {
            // TODO: Implement period queries for COMPOSITE types if needed (more complex)
            Log::warning('Period queries for COMPOSITE types are not yet fully supported directly via getReadingsForPeriod.', ['type_id' => $dataPointType?->id]);
            return collect();
        }

        // Caching for period queries can be complex due to date ranges. 
        // For simplicity, direct DB query for now, or cache with a key incorporating the precise range.
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
     * @return mixed
     */
    public function getAggregatedReadings(
        Device $device, 
        int $dataPointTypeId,
        string $aggregationFunction,
        Carbon $startTime, 
        Carbon $endTime,
        ?string $timeBucket = null
    ): mixed
    {
        $dataPointType = $this->resolveDataPointType($dataPointTypeId);
        if (!$dataPointType || $dataPointType->category === 'COMPOSITE') {
            Log::warning('Aggregation queries for COMPOSITE types are not yet supported directly.', ['type_id' => $dataPointType?->id]);
            return null;
        }

        $query = DeviceDataPoint::where('device_id', $device->id)
            ->where('data_point_type_id', $dataPointType->id)
            ->whereBetween('recorded_at', [$startTime, $endTime]);

        // Ensure aggregation function is safe (e.g., from a whitelist)
        $allowedAggregations = ['avg', 'sum', 'count', 'min', 'max'];
        $aggregationFunction = strtolower($aggregationFunction);
        if (!in_array($aggregationFunction, $allowedAggregations)) {
            Log::error('Invalid aggregation function requested.', ['function' => $aggregationFunction]);
            return null;
        }

        // For numeric aggregation, value should be a JSON number.
        // Casting (value#>>'{}') to numeric works if the JSONB value is a scalar (number or string representing a number).
        $valueColumnForNumericAggregation = DB::raw("(value#>>'{}')::numeric");

        if ($timeBucket) {
            $timeBucket = strtolower($timeBucket);
            $dateTruncExpression = match ($timeBucket) {
                'hour' => "DATE_TRUNC('hour', recorded_at)",
                'day' => "DATE_TRUNC('day', recorded_at)",
                default => null,
            };

            if (!$dateTruncExpression) {
                Log::error('Invalid time bucket for aggregation.', ['bucket' => $timeBucket]);
                return null;
            }

            return $query->selectRaw("{$dateTruncExpression} as time_group, {$aggregationFunction}({$valueColumnForNumericAggregation}) as aggregate_value")
                        ->groupBy('time_group')
                        ->orderBy('time_group')
                        ->pluck('aggregate_value', 'time_group');
        } else {
            // For a single aggregate value without grouping by time
            // Use Laravel's built-in aggregate functions if possible, or a raw expression
            switch ($aggregationFunction) {
                case 'count':
                    return $query->count(); // Counts rows, not the value itself unless specified
                // For other functions, we need to apply them to the value column.
                // The following will return a single value.
                case 'avg':
                case 'sum':
                case 'min':
                case 'max':
                     return $query->{$aggregationFunction}($valueColumnForNumericAggregation);
                default:
                    return null; // Should have been caught by allowedAggregations check
            }
        }
    }

    /**
     * Resolves DataPointType from ID.
     */
    protected function resolveDataPointType(int $id): ?DataPointType
    {
        // Find by integer ID directly
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

        $config = $compositeType->processing_steps;
        $logic = $config['logic'] ?? null;

        try {
            switch ($logic) {
                case 'GET_LATEST_FROM_SOURCE':
                    if (isset($config['source_data_point_type_id'])) {
                        // Pass the integer ID directly
                        return $this->getLatestReading($device, $config['source_data_point_type_id']);
                    }
                    break;
                
                case 'PRIORITY_PICK':
                    if (isset($config['sources']) && is_array($config['sources'])) {
                        $sources = collect($config['sources'])->sortBy('priority')->all();
                        foreach ($sources as $sourceConfig) {
                            if (!isset($sourceConfig['data_point_type_id'])) continue;
                            
                            // Pass the integer ID directly
                            $sourceValue = $this->getLatestReading($device, $sourceConfig['data_point_type_id']);
                            
                            if (isset($sourceConfig['transform']) && is_array($sourceConfig['transform']) && $sourceValue !== null) {
                                // $sourceValue = (new AtomicProcessor())->process($sourceValue, $sourceConfig['transform'], $device->vehicle); 
                                Log::debug('Inline transformation for composite source called but not fully implemented in this basic service', ['source' => $sourceConfig]);
                            }

                            if ($sourceValue !== null) {
                                return $sourceValue;
                            }
                        }
                    }
                    break;
                default:
                    Log::warning('Unknown or unsupported composite logic type.', ['logic' => $logic, 'type_id' => $compositeType->id]);
                    return null;
            }
        } catch (Throwable $e) {
            Log::error('Error calculating composite value', [
                'device_id' => $device->id, 
                'composite_type_id' => $compositeType->id, 
                'error' => $e->getMessage()
            ]);
            return null;
        }
        return null;
    }
}
