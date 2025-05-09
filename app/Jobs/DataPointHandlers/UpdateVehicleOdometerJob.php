<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceMessage;
use App\Models\Device;
use App\Models\Vehicle;
use App\Enum\DeviceDataPointType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateVehicleOdometerJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DeviceMessage $deviceMessage;
    protected ?Vehicle $vehicle;
    protected int $data;

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
        $this->vehicle = $vehicle;
        $this->data = intval($deviceMessage->dataPoints->where('data_point_type_id', MessageFields::TOTAL_ODOMETER->value)->first()->value);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (!$this->vehicle) {
            return;
        }
        if (!is_numeric($this->data)) {
            return;
        }

        $newOdometerInKm = $this->data / 1000;

        if ($newOdometerInKm < $this->vehicle->odometer) {
            return;
        }

        $this->vehicle->update(['odometer' => $newOdometerInKm]);
    }
} 