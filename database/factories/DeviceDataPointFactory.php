<?php

namespace Database\Factories;

use App\Models\DataPointType;
use App\Models\Device;
use App\Models\DeviceMessage;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeviceDataPoint>
 */
class DeviceDataPointFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $device = Device::factory()->create(); // Create device first
        $vehicle = $device->vehicle ?? Vehicle::factory()->create(); // Use device's vehicle or create one
        if (!$device->vehicle) {
            $device->vehicle()->associate($vehicle)->save();
        }

        return [
            'device_message_id' => DeviceMessage::factory(['device_id' => $device->id]),
            'device_id' => $device->id,
            'vehicle_id' => $vehicle->id,
            'data_point_type_id' => DataPointType::factory(), // Default, can be overridden
            'value' => fake()->word(), // Default value, override in tests
            'recorded_at' => fake()->dateTimeBetween('-1 hour'),
        ];
    }
}
