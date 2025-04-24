<?php

namespace Tests\Feature\GlobalSettings;

use App\Models\DeviceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_device_types_index_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('global-settings.device-types.index'));

        $response->assertOk();
        $response->assertInertia(fn ($assert) => $assert
            ->component('global-settings/device-types/index')
            ->has('deviceTypes')
        );
    }

    public function test_device_types_create_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('global-settings.device-types.create'));

        $response->assertOk();
        $response->assertInertia(fn ($assert) => $assert
            ->component('global-settings/device-types/create')
        );
    }

    public function test_device_type_can_be_created(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('global-settings.device-types.store'), [
                'name' => 'Test Device Type',
                'manufacturer' => 'Test Manufacturer',
            ]);

        $response->assertRedirect(route('global-settings.device-types.index'));
        $response->assertSessionHas('success', 'device_types.created');

        $this->assertDatabaseHas('device_types', [
            'name' => 'Test Device Type',
            'manufacturer' => 'Test Manufacturer',
        ]);
    }

    public function test_device_type_can_be_updated(): void
    {
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create([
            'name' => 'Old Name',
            'manufacturer' => 'Old Manufacturer',
        ]);

        $response = $this
            ->actingAs($user)
            ->put(route('global-settings.device-types.update', $deviceType), [
                'name' => 'New Name',
                'manufacturer' => 'New Manufacturer',
            ]);

        $response->assertRedirect(route('global-settings.device-types.index'));
        $response->assertSessionHas('success', 'device_types.updated');

        $this->assertDatabaseHas('device_types', [
            'id' => $deviceType->id,
            'name' => 'New Name',
            'manufacturer' => 'New Manufacturer',
        ]);
    }

    public function test_device_type_can_be_deleted(): void
    {
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create([
            'name' => 'Delete Me',
            'manufacturer' => 'Delete Me Manufacturer',
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(route('global-settings.device-types.destroy', $deviceType));

        $response->assertRedirect(route('global-settings.device-types.index'));
        $response->assertSessionHas('success', 'device_types.deleted');

        $this->assertSoftDeleted('device_types', [
            'id' => $deviceType->id,
        ]);
    }

    public function test_validation_fails_with_missing_fields(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('global-settings.device-types.store'), [
                'name' => '',
                'manufacturer' => '',
            ]);

        $response->assertSessionHasErrors(['name', 'manufacturer']);
    }
} 