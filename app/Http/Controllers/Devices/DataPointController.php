<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Http\Resources\Devices\DataPointTypeResource;
use App\Http\Resources\Devices\DeviceResource;
use App\Models\DataPointType;
use App\Models\Device;
use App\Services\DeviceTelemetryService;
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
        $dataPointTypes = DataPointTypeResource::collection(DataPointType::all());
        
        // Get all latest readings for the device in a single optimized query
        $latestReadings = $this->telemetryService->getAllLatestReadings($device);

        // Load device with all necessary relationships for consistent display
        $device->load([
            'type',
            'vehicle.tenant', 
            'vehicle.model.vehicleBrand',
            'tenant'
        ]);

        return Inertia::render('devices/datapoints', [
            'device' => new DeviceResource($device),
            'dataPointTypes' => $dataPointTypes,
            'latestReadings' => $latestReadings,
        ]);
    }
} 