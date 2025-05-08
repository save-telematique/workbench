<?php

namespace Database\Factories;

use App\Models\VehicleBrand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleModel>
 */
class VehicleModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_brand_id' => VehicleBrand::factory(),
            'name' => fake()->word(), // Example: Model name like 'Actros',
        ];
    }
}
