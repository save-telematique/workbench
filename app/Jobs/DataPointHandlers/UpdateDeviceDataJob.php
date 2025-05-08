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
use App\Models\Device;
use App\Models\Vehicle;
use App\Enum\DeviceDataPointType;

class UpdateDeviceDataJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DeviceDataPoint $deviceDataPoint;
    protected Device $device;
    // Vehicle property can be added if needed in the future, for now, it's passed but not stored if unused.
    // protected ?Vehicle $vehicle; 

    /**
     * Create a new job instance.
     *
     * @param DeviceDataPoint $deviceDataPoint
     * @param Device $device
     * @param Vehicle|null $vehicle
     */
    public function __construct(DeviceDataPoint $deviceDataPoint, Device $device, ?Vehicle $vehicle)
    {
        $this->deviceDataPoint = $deviceDataPoint;
        $this->device = $device;
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
        $data = $this->deviceDataPoint->data;

        $updateData = [];
        
        if (isset($data['firmwareVersion']) && $this->device->firmware_version !== $data['firmwareVersion']) {
            $updateData['firmware_version'] = $data['firmwareVersion'];
        }

        if (!empty($updateData)) {
            $this->device->update($updateData);
        }
    }
} 