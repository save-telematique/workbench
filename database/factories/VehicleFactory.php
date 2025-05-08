<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            // 'vehicle_brand_id' => VehicleBrand::factory(), // Column does not exist on vehicles table
            'vehicle_model_id' => VehicleModel::factory(),
            'vehicle_type_id' => VehicleType::factory(),
            'registration' => fake()->unique()->bothify('??-###-??'), // Correct column name
            'vin' => fake()->unique()->regexify('[A-HJ-NPR-Z0-9]{17}'),
            'country' => fake()->countryCode(), // Added missing column
            'odometer' => fake()->numberBetween(5000, 200000),
            // Removed fields not in migration: name, year, color
            // 'current_vehicle_location_id' can be left null initially
        ];
    }
}
