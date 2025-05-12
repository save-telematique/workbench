<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceDataPoint;
use App\Models\Device;
use App\Models\Vehicle;
use App\Models\Tenant;
use App\Models\VehicleStatus;
use App\Helpers\GeoHelper;
use App\Models\VehicleLocation;
use App\Enum\DeviceDataPointType;
use App\Models\DeviceMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcessGpsDataJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DeviceMessage $deviceMessage;
    protected Device $device;
    protected ?Vehicle $vehicle;
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
        $this->vehicle = $vehicle;
        $this->data = $deviceMessage->dataPoints->where('data_point_type_id', MessageFields::GPS_DATA->value)->first()->value;
    }


    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        if (!$this->vehicle) {
            return;
        }

        if (!is_array($this->data) || 
            !isset($this->data['latitude']) || 
            !isset($this->data['longitude']) || 
            !isset($this->data['altitude']) || 
            !isset($this->data['angle']) || 
            !isset($this->data['satellites']) || 
            !isset($this->data['speed'])) {
            Log::error('ProcessGpsDataJob: Invalid GPS data or missing coordinates.', [
                'device_message_id' => $this->deviceMessage->id,
                'device_id' => $this->device->id,
                'vehicle_id' => $this->vehicle->id,
                'data' => $this->data,
            ]);
            return;
        }

        $latitude = (float) $this->data['latitude'];
        $longitude = (float) $this->data['longitude'];

        // This is the message time
        $timestamp = $this->deviceMessage->created_at;

        if ($latitude == 0 && $longitude == 0) {
            Log::warning('ProcessGpsDataJob: Zero coordinates, skipping update.', [
                'device_message_id' => $this->deviceMessage->id,
                'device_id' => $this->device->id,
                'vehicle_id' => $this->vehicle->id,
            ]);
            return;
        }

        $movement = $this->deviceMessage->dataPoints->where('data_point_type_id', MessageFields::MOVEMENT->value)->first()?->value;
        $ignition = $this->deviceMessage->dataPoints->where('data_point_type_id', MessageFields::IGNITION->value)->first()?->value;
        $locationData = [
            'vehicle_id' => $this->vehicle->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'altitude' => (float) $this->data['altitude'],
            'heading' => (int) $this->data['angle'],
            'satellites' => (int) $this->data['satellites'],
            'speed' => (float) $this->data['speed'],
            'moving' => (bool) $movement ?? false,
            'ignition' => (bool) $ignition ?? false,
            'recorded_at' => $timestamp,
            'device_message_id' => $this->deviceMessage->id,
        ];

        $currentLocation = $this->vehicle->currentLocation;

        if ($currentLocation) {
            $timeDiffSeconds = abs($currentLocation->recorded_at->diffInSeconds($timestamp));
            $distanceMeters = GeoHelper::vincentyGreatCircleDistance($currentLocation->latitude, $currentLocation->longitude, $latitude, $longitude);
            
            if ($timeDiffSeconds < 120 && $distanceMeters < 25) {
                return;
            }

            if ($timeDiffSeconds > 0) {
                 $maxSpeedKmh = 160; 
                 $maxSpeedMetersPerSecond = $maxSpeedKmh * 1000 / 3600;
                 $maxDistancePossible = $maxSpeedMetersPerSecond * $timeDiffSeconds;
                 if ($distanceMeters > $maxDistancePossible * 1.2) {
                        Log::warning('Skipping GPS data point: physically improbable distance for time diff', [
                            'vehicle_id' => $this->vehicle->id, 
                            'distance_m' => $distanceMeters, 
                            'time_diff_s' => $timeDiffSeconds, 
                            'max_dist_possible_m' => round($maxDistancePossible,2)
                        ]);
                     return;
                 }
            }
        }

        $location = VehicleLocation::create($locationData);
        $this->vehicle->current_vehicle_location_id = $location->id;
        $this->vehicle->save();
    }
} 