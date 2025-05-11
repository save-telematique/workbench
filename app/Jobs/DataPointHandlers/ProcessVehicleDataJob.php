<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Device;
use App\Models\Vehicle;
use App\Models\DeviceMessage;

class ProcessVehicleDataJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected DeviceMessage $deviceMessage, protected Device $device, protected ?Vehicle $vehicle)
    {
    }

    public function handle(): void
    {
        if (!$this->vehicle) {
            return;
        }

        $fields = $this->deviceMessage->dataPoints;

        $vin = $fields->where('data_point_type_id', MessageFields::VIN->value)->first();
        if ($vin) {
            if ($this->vehicle->vin == null || $this->vehicle->vin == "VIN") {
                $this->vehicle->vin = $vin->value;
            }
        }

        $vrn = $fields->where('data_point_type_id', MessageFields::VRN->value)->first();
        if ($vrn) {
            if ($this->vehicle->registration == null || $this->vehicle->registration == "VRN") {
                $this->vehicle->registration = $vrn->value;
            }
        }

        $this->vehicle->save();
    }
}