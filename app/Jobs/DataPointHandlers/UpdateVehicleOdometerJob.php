<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceDataPoint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateVehicleOdometerJob implements ShouldQueue, DataPointHandlerJob
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
        // The original listener specifically checked for TOTAL_ODOMETER.
        return [MessageFields::TOTAL_ODOMETER->value]; 
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $odometer = $this->deviceDataPoint->value; 

        if (!is_numeric($odometer)) {
            return;
        }

        $odometerKm = $odometer / 1000;

        $vehicle = $this->deviceDataPoint->device->vehicle;
        if (!$vehicle) {
            return;
        }

        if ($odometerKm > ($vehicle->odometer ?? 0)) {
            $vehicle->odometer = (float) $odometerKm;
            $vehicle->save();
        }
    }
} 