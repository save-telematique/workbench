<?php

namespace Database\Factories;

use App\Models\DeviceType;
use App\Models\Tenant;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Device>
 */
class DeviceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'device_type_id' => DeviceType::factory(),
            'tenant_id' => null,
            'vehicle_id' => null,
            'firmware_version' => 'v' . $this->faker->numerify('#.##.##'),
            'serial_number' => strtoupper($this->faker->bothify('??-#####')),
            'sim_number' => $this->faker->numerify('###########'),
            'imei' => $this->faker->numerify('###############'),
        ];
    }

    /**
     * Indicate that the device belongs to a tenant.
     */
    public function forTenant(Tenant $tenant = null): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => $tenant?->id ?? Tenant::factory(),
        ]);
    }

    /**
     * Indicate that the device is assigned to a vehicle.
     */
    public function forVehicle(Vehicle $vehicle = null): static
    {
        return $this->state(fn (array $attributes) => [
            'vehicle_id' => $vehicle?->id ?? Vehicle::factory(),
        ]);
    }
} 