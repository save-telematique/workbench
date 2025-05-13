<?php

namespace App\Actions\DataPoints;

use App\Http\Resources\Devices\DataPointResource;
use App\Models\Vehicle;
use App\Services\VehicleTelemetryService;
use Carbon\Carbon;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class GetVehicleDataPointsAction
{
    use AsAction;

    protected VehicleTelemetryService $telemetryService;

    public function __construct(VehicleTelemetryService $telemetryService)
    {
        $this->telemetryService = $telemetryService;
    }

    public function rules(): array
    {
        return [
            'device' => 'required|string|exists:devices,id',
            'data_point_type_id' => 'required|integer|exists:data_point_types,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'aggregation' => 'nullable|string|in:avg,min,max,sum,count',
        ];
    }

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('view', $request->vehicle);
    }

    public function handle(
        Vehicle $vehicle,
        int $dataPointTypeId,
        Carbon $startTime,
        Carbon $endTime,
        ?string $aggregation = null
    ) {
        // Handle aggregation if requested
        if ($aggregation) {
            $data = $this->telemetryService->getAggregatedReadings(
                $vehicle,
                $dataPointTypeId,
                $aggregation,
                $startTime,
                $endTime,
                $this->determineTimeBucket($startTime, $endTime)
            );
            
            return $data;
        }
        
        // For regular data points, use our resource collection
        $readings = $this->telemetryService->getReadingsForPeriod(
            $vehicle,
            $dataPointTypeId,
            $startTime,
            $endTime
        );
        
        return $readings;
    }

    public function asController(ActionRequest $request, Vehicle $vehicle)
    {
        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);
        
        $result = $this->handle(
            $vehicle,
            $request->data_point_type_id,
            $startTime,
            $endTime,
            $request->aggregation
        );
        
        return DataPointResource::collection($result);
    }
    
    /**
     * Determine the appropriate time bucket based on time range.
     *
     * @param Carbon $startTime
     * @param Carbon $endTime
     * @return string|null
     */
    protected function determineTimeBucket(Carbon $startTime, Carbon $endTime): ?string
    {
        $diffInHours = $endTime->diffInHours($startTime);
        
        if ($diffInHours <= 24) {
            return 'hour'; // Hourly aggregation for ranges up to 24 hours
        }
        
        return 'day'; // Daily aggregation for longer ranges
    }
} 