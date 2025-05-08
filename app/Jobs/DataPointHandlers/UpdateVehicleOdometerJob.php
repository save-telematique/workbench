<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceDataPoint;
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

    protected DeviceDataPoint $deviceDataPoint;
    // Device is passed to constructor but not explicitly used if vehicle is the primary focus.
    // protected Device $device; 
    protected ?Vehicle $vehicle;

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
        $this->vehicle = $vehicle;
    }

    /**
     * Get the data point type IDs that this job reacts to.
     *
     * @return array<int>
     */
    public static function getReactsToDataPointTypes(): array
    {
        return [MessageFields::TOTAL_ODOMETER->value]; 
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (!$this->vehicle) {
            return;
        }
        $odometerValue = $this->deviceDataPoint->value; 

        if (!is_numeric($odometerValue)) {
            return;
        }

        $newOdometerInKm = $odometerValue / 1000;

        if ($newOdometerInKm < $this->vehicle->odometer) {
            return;
        }

        $this->vehicle->update(['odometer' => $newOdometerInKm]);
    }
} 