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

class ProcessGpsDataJob implements ShouldQueue, DataPointHandlerJob
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
        return [MessageFields::GPS_DATA->value];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $gpsValue = $this->deviceDataPoint->value;
        if (!is_array($gpsValue) || 
            !isset($gpsValue['latitude']) || 
            !isset($gpsValue['longitude']) || 
            !isset($gpsValue['altitude']) || 
            !isset($gpsValue['angle']) || 
            !isset($gpsValue['satellites']) || 
            !isset($gpsValue['speed'])) {
            Log::warning('GPS data point has invalid or incomplete value structure', [
                'device_data_point_id' => $this->deviceDataPoint->id,
                'value' => $gpsValue,
            ]);
            return;
        }

        $latitude = (float) $gpsValue['latitude'];
        $longitude = (float) $gpsValue['longitude'];

        if ($latitude == 0 && $longitude == 0) {
            return;
        }

        $device = $this->deviceDataPoint->device;
        if (!$device || !$device->vehicle) {
            return;
        }
        $vehicle = $device->vehicle;
        
        $movement = $gpsValue['movement'] ?? false;
        $ignition = $gpsValue['ignition'] ?? false;

        $locationData = [
            'vehicle_id' => $vehicle->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'altitude' => (float) $gpsValue['altitude'],
            'heading' => (int) $gpsValue['angle'],
            'satellites' => (int) $gpsValue['satellites'],
            'speed' => (float) $gpsValue['speed'],
            'moving' => (bool) $movement,
            'ignition' => (bool) $ignition,
            'recorded_at' => $this->deviceDataPoint->recorded_at,
            'device_message_id' => $this->deviceDataPoint->device_message_id,
        ];

        $currentLocation = $vehicle->currentLocation;
        $recordedAt = $this->deviceDataPoint->recorded_at;

        if ($currentLocation) {
            $timeDiffSeconds = abs($currentLocation->recorded_at->diffInSeconds($recordedAt));
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
                            'vehicle_id' => $vehicle->id, 
                            'distance_m' => $distanceMeters, 
                            'time_diff_s' => $timeDiffSeconds, 
                            'max_dist_possible_m' => round($maxDistancePossible,2)
                        ]);
                     return;
                 }
            }
        }

        $location = VehicleLocation::create($locationData);
        $vehicle->current_vehicle_location_id = $location->id;
        $vehicle->save();
    }
} 