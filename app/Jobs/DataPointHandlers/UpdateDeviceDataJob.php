<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceDataPoint;
use App\Helpers\GeoHelper;
use App\Models\VehicleLocation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateDeviceDataJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private DeviceDataPoint $deviceDataPoint;

    /**
     * Create a new job instance.
     */
    public function __construct(DeviceDataPoint $deviceDataPoint)
    {
        $this->deviceDataPoint = $deviceDataPoint;
    }

    /**
     * Get the data point type IDs that this job reacts to.
     *
     * @return array<int>
     */
    public static function getReactsToDataPointTypes(): array
    {
        return [MessageFields::DEVICE_DATA->value];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $deviceData = $this->deviceDataPoint->value;
        
        $device = $this->deviceDataPoint->device;
        
        if (isset($deviceData['firmwareVersion']) && $device->firmware_version !== $deviceData['firmwareVersion']) {
            $device->firmware_version = $deviceData['firmwareVersion'];
            $device->save();
        }
    }
} 