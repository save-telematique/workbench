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

    protected DeviceDataPoint $deviceDataPoint;
    protected Device $device;
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
        $this->device = $device;
        $this->vehicle = $vehicle;
    }

    /**
     * @return DeviceDataPointType[]
     */
    public static function getReactsToDataPointTypes(): array
    {
        return [MessageFields::GPS_DATA->value];
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

        $data = $this->deviceDataPoint->value;
        if (!is_array($data) || 
            !isset($data['latitude']) || 
            !isset($data['longitude']) || 
            !isset($data['altitude']) || 
            !isset($data['angle']) || 
            !isset($data['satellites']) || 
            !isset($data['speed'])) {
            Log::error('ProcessGpsDataJob: Invalid GPS data or missing coordinates.', [
                'device_data_point_id' => $this->deviceDataPoint->id,
                'device_id' => $this->device->id,
                'vehicle_id' => $this->vehicle->id,
                'data' => $data,
            ]);
            return;
        }

        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];
        $timestamp = $this->deviceDataPoint->recorded_at;

        if ($latitude == 0 && $longitude == 0) {
            Log::warning('ProcessGpsDataJob: Zero coordinates, skipping update.', [
                'device_data_point_id' => $this->deviceDataPoint->id,
                'device_id' => $this->device->id,
                'vehicle_id' => $this->vehicle->id,
            ]);
            return;
        }

        $movement = $data['movement'] ?? false;
        $ignition = $data['ignition'] ?? false;

        $locationData = [
            'vehicle_id' => $this->vehicle->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'altitude' => (float) $data['altitude'],
            'heading' => (int) $data['angle'],
            'satellites' => (int) $data['satellites'],
            'speed' => (float) $data['speed'],
            'moving' => (bool) $movement,
            'ignition' => (bool) $ignition,
            'recorded_at' => $timestamp,
            'device_message_id' => $this->deviceDataPoint->device_message_id,
            'tenant_id' => $this->vehicle->tenant_id,
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