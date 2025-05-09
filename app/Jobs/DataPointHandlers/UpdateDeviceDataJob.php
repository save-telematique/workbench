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
use App\Models\DeviceMessage;

class UpdateDeviceDataJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DeviceMessage $deviceMessage;
    protected Device $device;
    protected array $data;

    /**
     * Create a new job instance.
     *
     * @param DeviceMessage $deviceMessage
     * @param Device $device
     * @param Vehicle|null $vehicle
     */
    public function __construct(DeviceMessage $deviceMessage, Device $device, ?Vehicle $vehicle)
    {
        $this->deviceMessage = $deviceMessage;
        $this->device = $device;
        $this->data = $deviceMessage->dataPoints->where('data_point_type_id', MessageFields::DEVICE_DATA->value)->first()->value;
    }


    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $updateData = [];
        
        if (isset($this->data['firmwareVersion']) && $this->device->firmware_version !== $this->data['firmwareVersion']) {
            $updateData['firmware_version'] = $this->data['firmwareVersion'];
        }

        if (!empty($updateData)) {
            $this->device->update($updateData);
        }
    }
} 