<?php

namespace App\Contracts;

use App\Events\NewDeviceDataPoint; // Though the job will receive DeviceDataPoint directly
use App\Models\Device;
use App\Models\DeviceDataPoint;
use App\Models\DeviceMessage;
use App\Models\Vehicle;

interface DataPointHandlerJob
{
   
    public function __construct(DeviceMessage $deviceMessage, Device $device, ?Vehicle $vehicle);

    /**
     * Handle the incoming device data point.
     * Assumes the DeviceDataPoint was provided during job construction.
     *
     * @return void
     */
    public function handle(): void;
} 