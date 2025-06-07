<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Geofence>
 */
class GeofenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate a simple rectangular geofence around a random location
        $centerLat = fake()->latitude(45, 55); // Roughly Europe
        $centerLng = fake()->longitude(-5, 15);
        
        // Create a small rectangle around the center point (about 500m x 500m)
        $offset = 0.005; // Roughly 500 meters
        
        $polygon = [
            'type' => 'Polygon',
            'coordinates' => [[
                [$centerLng - $offset, $centerLat - $offset], // SW
                [$centerLng + $offset, $centerLat - $offset], // SE
                [$centerLng + $offset, $centerLat + $offset], // NE
                [$centerLng - $offset, $centerLat + $offset], // NW
                [$centerLng - $offset, $centerLat - $offset], // SW (close)
            ]]
        ];

        return [
            'tenant_id' => Tenant::factory(),
            'group_id' => fake()->optional(0.3)->randomElement([Group::factory()]), // 30% chance of having a group
            'name' => fake()->words(2, true) . ' Zone',
            'geojson' => $polygon,
            'is_active' => fake()->boolean(90), // 90% chance of being active
        ];
    }

    /**
     * Create a circular geofence.
     */
    public function circular(): static
    {
        return $this->state(function (array $attributes) {
            $centerLat = fake()->latitude(45, 55);
            $centerLng = fake()->longitude(-5, 15);
            $radius = fake()->numberBetween(100, 1000); // meters
            
            // Generate circle as polygon (approximation with 16 points)
            $points = [];
            for ($i = 0; $i <= 16; $i++) {
                $angle = ($i * 2 * M_PI) / 16;
                $lat = $centerLat + ($radius / 111320) * cos($angle);
                $lng = $centerLng + ($radius / (111320 * cos($centerLat * M_PI / 180))) * sin($angle);
                $points[] = [$lng, $lat];
            }
            
            return [
                'geojson' => [
                    'type' => 'Polygon',
                    'coordinates' => [$points]
                ]
            ];
        });
    }

    /**
     * Create an active geofence.
     */
    public function active(): static
    {
        return $this->state(['is_active' => true]);
    }

    /**
     * Create an inactive geofence.
     */
    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
