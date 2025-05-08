<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Models\DataPointType;
use App\Models\Device;
use App\Services\DeviceTelemetryService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataPointController extends Controller
{
    protected DeviceTelemetryService $telemetryService;

    public function __construct(DeviceTelemetryService $telemetryService)
    {
        $this->telemetryService = $telemetryService;
        $this->authorizeResource(Device::class, 'device');
    }

    /**
     * Display the datapoints explorer page for the device.
     *
     * @param Device $device
     * @return \Inertia\Response
     */
    public function index(Device $device)
    {
        // Get all data point types
        $dataPointTypes = DataPointType::all();
        
        // Get latest readings for each data point type
        $latestReadings = collect($dataPointTypes)->mapWithKeys(function ($dataPointType) use ($device) {
            return [$dataPointType->id => $this->telemetryService->getLatestReading($device, $dataPointType->id)];
        })->filter()->all();

        // Load device with all necessary relationships for consistent display
        $device->load([
            'type',
            'vehicle.tenant', 
            'vehicle.model.vehicleBrand',
            'tenant'
        ]);

        return Inertia::render('devices/datapoints', [
            'device' => $device,
            'dataPointTypes' => $dataPointTypes,
            'latestReadings' => $latestReadings,
        ]);
    }

    /**
     * API endpoint to get data points for a specific data point type and time range.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDataPoints(Request $request)
    {
        $request->validate([
            'device' => 'required|string|exists:devices,id',
            'data_point_type_id' => 'required|integer|exists:data_point_types,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'aggregation' => 'nullable|string|in:avg,min,max,sum,count',
        ]);

        $device = Device::findOrFail($request->device);
        $this->authorize('view', $device);
        
        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);
        
        // Handle aggregation if requested
        if ($request->has('aggregation') && !empty($request->aggregation)) {
            return $this->telemetryService->getAggregatedReadings(
                $device,
                $request->data_point_type_id,
                $request->aggregation,
                $startTime,
                $endTime,
                $this->determineTimeBucket($startTime, $endTime)
            );
        }
        
        // Return regular data points
        return $this->telemetryService->getReadingsForPeriod(
            $device,
            $request->data_point_type_id,
            $startTime,
            $endTime
        );
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