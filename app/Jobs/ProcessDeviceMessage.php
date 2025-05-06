<?php

namespace App\Jobs;

use App\Enum\MessageFields;
use App\Helpers\GeoHelper;
use App\Models\DeviceMessage;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;

class ProcessDeviceMessage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public DeviceMessage $message)
    {
        //
    }

    /**
     * Process GPS data from the device message.
     *
     * @param Collection $fields
     * @param Vehicle $vehicle
     * @param Carbon $recordedAt
     * @return void
     */
    protected function handleGpsData(Collection $fields, Vehicle $vehicle, Carbon $recordedAt): void
    {
        if (!$fields->has(MessageFields::GPS_DATA->value)) {
            return;
        }
        
        $gpsData = $fields->get(MessageFields::GPS_DATA->value);
        $latitude = $gpsData['latitude'];
        $longitude = $gpsData['longitude'];
        
        // Skip invalid GPS coordinates
        if ($latitude == 0 || $longitude == 0) {
            return;
        }

        // Create location data array
        $locationData = [
            'vehicle_id' => $vehicle->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'altitude' => $gpsData['altitude'],
            'heading' => $gpsData['angle'],
            'satellites' => $gpsData['satellites'],
            'speed' => $gpsData['speed'],
            'moving' => $fields->get(MessageFields::MOVEMENT->value) ?? 0,
            'ignition' => $fields->get(MessageFields::IGNITION->value) ?? 0,
            'recorded_at' => $recordedAt,
            'device_message_id' => $this->message->id,
        ];

        // Get current location for validation
        $currentLocation = $vehicle->currentLocation;
        
        // Skip if location hasn't changed significantly
        if ($currentLocation) {
            $timeDiff = abs($currentLocation->recorded_at->diffInSeconds($recordedAt));
            
            if ($currentLocation) {
                $timeDiff = abs($currentLocation->recorded_at->diffInSeconds($recordedAt));
                $maxSpeed = 28; // 100 km/h to m/s

                $distance = GeoHelper::vincentyGreatCircleDistance($currentLocation->latitude, $currentLocation->longitude, $latitude, $longitude);

                if ($timeDiff < 120 && $distance < 15) {
                    return;
                }

                $maxDistance = $maxSpeed * $timeDiff;
                if ($distance > $maxDistance) {
                    return;
                }
            }

            // Skip if the movement is physically impossible (likely incorrect GPS data)
            $maxSpeed = 28; // 100 km/h in m/s
            $maxDistance = $maxSpeed * $timeDiff;
            
            if ($timeDiff > 0) {
                $distance = GeoHelper::vincentyGreatCircleDistance(
                    $currentLocation->latitude, 
                    $currentLocation->longitude, 
                    $latitude, 
                    $longitude
                );
                
                if ($distance > $maxDistance) {
                    return;
                }
            }
        }

        // Store the new location
        $location = $vehicle->locations()->create($locationData);
        
        // Update the vehicle with the new current location
        $vehicle->current_vehicle_location_id = $location->id;
    }

    /**
     * Process device data from the device message.
     *
     * @param Collection $fields
     * @return void
     */
    protected function handleDeviceData(Collection $fields): void
    {
        if (!$fields->has(MessageFields::DEVICE_DATA->value)) {
            return;
        }
        
        $deviceData = $fields->get(MessageFields::DEVICE_DATA->value);
        $device = $this->message->device;
        
        if (isset($boxData['firmwareVersion'])) {
            $device->firmware_version = $deviceData['firmwareVersion'];
            $device->save();
        }
    }

    /**
     * Handle odometer data from the device message.
     *
     * @param Collection $fields
     * @param Vehicle $vehicle
     * @return void
     */
    protected function handleOdometerData(Collection $fields, Vehicle $vehicle): void
    {
        if ($fields->has(MessageFields::TOTAL_ODOMETER->value)) {
            $odometer = intval($fields->get(MessageFields::TOTAL_ODOMETER->value)) / 1000;
            $vehicle->odometer = $odometer;
        }
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Skip if message was already processed
        if ($this->message->processed_at !== null) {
            return;
        }

        // Skip if device is not associated with a vehicle
        if ($this->message->device->vehicle_id === null) {
            $this->message->processed_at = now();
            $this->message->save();
            return;
        }

        // Process message if it exists
        if (isset($this->message->message)) {
            $recordedAt = Carbon::parse($this->message->message['messageTimeUtc'], 'UTC')
                ->tz(config('app.timezone'));
                
            $fields = collect($this->message->message['fields']);
            $vehicle = $this->message->device->vehicle;

            // Process different types of data
            $this->handleGpsData($fields, $vehicle, $recordedAt);
            $this->handleDeviceData($fields);
            $this->handleOdometerData($fields, $vehicle);

            // Save vehicle changes
            $vehicle->save();
        }

        // Update device last contact time
        $this->message->device->last_contact_at = $this->message->created_at;
        $this->message->device->save();

        // Mark message as processed
        $this->message->processed_at = now();
        $this->message->save();
    }
}
