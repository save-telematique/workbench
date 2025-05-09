<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Driver>
 */
class DriverFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'surname' => $this->faker->lastName(),
            'firstname' => $this->faker->firstName(),
            'license_number' => $this->faker->bothify('??######'),
            'phone' => $this->faker->e164PhoneNumber(),
            'tenant_id' => Tenant::factory(),
            'user_id' => null,
            'card_issuing_country' => $this->faker->countryCode(),
            'card_number' => $this->faker->bothify('??########'),
            'birthdate' => $this->faker->dateTimeBetween('-60 years', '-20 years'),
            'card_issuing_date' => $this->faker->dateTimeBetween('-5 years', '-1 year'),
            'card_expiration_date' => $this->faker->dateTimeBetween('+1 year', '+5 years'),
        ];
    }

    /**
     * Configure the model to have no tenant association.
     */
    public function withoutTenant(): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => null,
        ]);
    }

    /**
     * Configure the model to be associated with a user.
     */
    public function withUser(User $user = null): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user ? $user->id : User::factory()->create()->id,
            'tenant_id' => $user ? $user->tenant_id : Tenant::factory()->create()->id,
        ]);
    }
} 