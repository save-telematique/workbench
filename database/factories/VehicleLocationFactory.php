<?php

namespace Database\Factories;

use App\Models\DeviceMessage;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleLocation>
 */
class VehicleLocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_id' => Vehicle::factory(),
            'device_message_id' => DeviceMessage::factory(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'altitude' => fake()->numberBetween(0, 300),
            'heading' => fake()->numberBetween(0, 359),
            'speed' => fake()->numberBetween(0, 120),
            'satellites' => fake()->numberBetween(3, 15),
            'moving' => fake()->boolean(),
            'ignition' => fake()->boolean(),
            'recorded_at' => fake()->dateTimeBetween('-1 hour'),
        ];
    }
}
