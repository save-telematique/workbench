<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DataPointType>
 */
class DataPointTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Note: ID needs to be unique and managed carefully in tests 
        // if not relying on sequence/auto-increment for test-specific types.
        return [
            'id' => fake()->unique()->numberBetween(2000000, 3000000), // Use a high range for test-specific IDs
            'name' => fake()->word(),
            'unit' => null,
            'category' => 'ATOMIC',
            'processing_steps' => [[ 'operation' => 'STORE_AS_STRING' ]], // Default simple processing
            'description' => fake()->sentence(),
        ];
    }
}
