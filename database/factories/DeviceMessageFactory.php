<?php

namespace Database\Factories;

use App\Models\Device;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeviceMessage>
 */
class DeviceMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'device_id' => Device::factory(),
            'message' => [ // Default basic message structure
                'messageTimeUtc' => now()->subMinutes(rand(1,60))->toIso8601String(),
                'fields' => [],
            ],
            'ip' => fake()->ipv4(),
            'processed_at' => null,
            'created_at' => now(), // Match DB behavior (though not strictly needed for test)
            'updated_at' => now(), // Match DB behavior
        ];
    }

    /**
     * Indicate that the message should be considered processed.
     */
    public function processed(): static
    {
        return $this->state(fn (array $attributes) => [
            'processed_at' => now(),
        ]);
    }
    
    /**
     * Set specific message content.
     */
    public function withMessageContent(array $content): static
    {
        return $this->state(fn (array $attributes) => [
            'message' => $content,
        ]);
    }
}
