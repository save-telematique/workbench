<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceDataPoint;
use App\Models\Device;
use App\Models\Vehicle;
use App\Models\Tenant;
use App\Models\VehicleStatus;
use App\Models\Geofence;
use App\Helpers\GeoHelper;
use App\Models\VehicleLocation;
use App\Enum\DeviceDataPointType;
use App\Models\DeviceMessage;
use App\Events\WorkflowTriggered;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
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
            
            if ($timeDiffSeconds < 120 /*&& $distanceMeters < 100*/) {
                return;
            }

            /*if ($timeDiffSeconds > 0) {
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
            }*/
        }

        $location = VehicleLocation::create($locationData);
        $this->vehicle->current_vehicle_location_id = $location->id;
        $this->vehicle->save();

        // Trigger workflow events
        $this->triggerWorkflowEvents($location, $currentLocation);
    }

    /**
     * Trigger workflow events based on location changes.
     */
    protected function triggerWorkflowEvents(VehicleLocation $newLocation, ?VehicleLocation $previousLocation): void
    {
        $locationData = [
            'latitude' => $newLocation->latitude,
            'longitude' => $newLocation->longitude,
            'speed' => $newLocation->speed,
            'ignition' => $newLocation->ignition,
            'moving' => $newLocation->moving,
            'recorded_at' => $newLocation->recorded_at->toISOString(),
        ];

        $previousLocationData = $previousLocation ? [
            'latitude' => $previousLocation->latitude,
            'longitude' => $previousLocation->longitude,
            'speed' => $previousLocation->speed,
            'ignition' => $previousLocation->ignition,
            'moving' => $previousLocation->moving,
            'recorded_at' => $previousLocation->recorded_at->toISOString(),
        ] : null;

        // Vehicle location updated event
        WorkflowTriggered::vehicleLocationUpdated(
            $this->vehicle,
            $locationData,
            $previousLocationData
        );

        // Check for ignition changes
        if ($previousLocation && $previousLocation->ignition !== $newLocation->ignition) {
            if ($newLocation->ignition) {
                WorkflowTriggered::vehicleIgnitionOn($this->vehicle, $locationData);
            } else {
                WorkflowTriggered::vehicleIgnitionOff($this->vehicle, $locationData);
            }
        }

        // Check for movement changes
        if ($previousLocation && $previousLocation->moving !== $newLocation->moving) {
            if ($newLocation->moving) {
                WorkflowTriggered::vehicleMovementStarted(
                    $this->vehicle,
                    $locationData
                );
            } else {
                WorkflowTriggered::vehicleMovementStopped(
                    $this->vehicle,
                    $locationData
                );
            }
        }

        // Check for speed exceeded (example: 90 km/h limit)
        $speedLimit = 90; // This could come from vehicle settings or geofence
        if ($newLocation->speed > $speedLimit) {
            WorkflowTriggered::vehicleSpeedExceeded(
                $this->vehicle,
                $newLocation->speed,
                $speedLimit
            );
        }

        // Check for geofence entry/exit
        $this->checkGeofenceEvents($newLocation, $previousLocation);
    }

    /**
     * Check for geofence entry/exit events.
     */
    protected function checkGeofenceEvents(VehicleLocation $newLocation, ?VehicleLocation $previousLocation): void
    {
        // Get all active geofences for this vehicle's tenant
        $geofences = Cache::remember(
            "geofences_tenant_{$this->vehicle->tenant_id}",
            now()->addMinutes(5), // Cache for 5 minutes
            fn() => Geofence::where('tenant_id', $this->vehicle->tenant_id)
                ->active()
                ->get()
        );

        if ($geofences->isEmpty()) {
            return;
        }

        $currentGeofences = [];
        $previousGeofences = [];

        $locationData = [
            'latitude' => $newLocation->latitude,
            'longitude' => $newLocation->longitude,
            'speed' => $newLocation->speed,
            'ignition' => $newLocation->ignition,
            'moving' => $newLocation->moving,
            'recorded_at' => $newLocation->recorded_at->toISOString(),
        ];

        // Check which geofences contain the current location
        foreach ($geofences as $geofence) {
            if ($geofence->containsPoint($newLocation->latitude, $newLocation->longitude)) {
                $currentGeofences[] = $geofence;
            }
        }

        // Check which geofences contained the previous location
        if ($previousLocation) {
            foreach ($geofences as $geofence) {
                if ($geofence->containsPoint($previousLocation->latitude, $previousLocation->longitude)) {
                    $previousGeofences[] = $geofence;
                }
            }
        }

        $currentGeofenceIds = collect($currentGeofences)->pluck('id')->toArray();
        $previousGeofenceIds = collect($previousGeofences)->pluck('id')->toArray();

        // Check for geofence entries (in current but not in previous)
        $enteredGeofenceIds = array_diff($currentGeofenceIds, $previousGeofenceIds);
        foreach ($enteredGeofenceIds as $geofenceId) {
            $geofence = collect($currentGeofences)->firstWhere('id', $geofenceId);
            if ($geofence) {
                WorkflowTriggered::vehicleEnteredGeofence(
                    $this->vehicle,
                    $geofence,
                    $locationData
                );

                Log::info('Vehicle entered geofence', [
                    'vehicle_id' => $this->vehicle->id,
                    'vehicle_name' => $this->vehicle->name,
                    'geofence_id' => $geofence->id,
                    'geofence_name' => $geofence->name,
                    'latitude' => $newLocation->latitude,
                    'longitude' => $newLocation->longitude,
                ]);
            }
        }

        // Check for geofence exits (in previous but not in current)
        $exitedGeofenceIds = array_diff($previousGeofenceIds, $currentGeofenceIds);
        foreach ($exitedGeofenceIds as $geofenceId) {
            $geofence = collect($previousGeofences)->firstWhere('id', $geofenceId);
            if ($geofence) {
                // Get entry data from cache if available
                $entryDataKey = "vehicle_{$this->vehicle->id}_geofence_{$geofence->id}_entry";
                $entryData = Cache::get($entryDataKey);
                
                WorkflowTriggered::vehicleExitedGeofence(
                    $this->vehicle,
                    $geofence,
                    $locationData,
                    $entryData
                );

                // Clear the entry data from cache
                Cache::forget($entryDataKey);

                Log::info('Vehicle exited geofence', [
                    'vehicle_id' => $this->vehicle->id,
                    'vehicle_name' => $this->vehicle->name,
                    'geofence_id' => $geofence->id,
                    'geofence_name' => $geofence->name,
                    'latitude' => $newLocation->latitude,
                    'longitude' => $newLocation->longitude,
                    'duration_inside' => $entryData ? now()->diffInSeconds($entryData['entry_time'] ?? now()) : null,
                ]);
            }
        }

        // Store entry data for current geofences (for duration calculation on exit)
        foreach ($currentGeofences as $geofence) {
            $entryDataKey = "vehicle_{$this->vehicle->id}_geofence_{$geofence->id}_entry";
            if (!Cache::has($entryDataKey)) {
                Cache::put($entryDataKey, [
                    'entry_time' => now()->toISOString(),
                    'entry_location' => $locationData,
                ], now()->addDays(1)); // Keep for 1 day max
            }
        }
    }
} 