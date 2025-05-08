<?php

namespace App\Contracts;

use App\Events\NewDeviceDataPoint; // Though the job will receive DeviceDataPoint directly
use App\Models\DeviceDataPoint;

interface DataPointHandlerJob
{
    /**
     * Get the data point type IDs that this job reacts to.
     * Expected to return an array of integers (MessageFields enum values).
     *
     * @return array<int>
     */
    public static function getReactsToDataPointTypes(): array;

    /**
     * Handle the incoming device data point.
     * Assumes the DeviceDataPoint was provided during job construction.
     *
     * @return void
     */
    public function handle(): void;
} 