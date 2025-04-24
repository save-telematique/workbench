<?php

namespace Tests\Feature\Devices;

use App\Models\Device;
use App\Models\DeviceType;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceTest extends TestCase
{
    use RefreshDatabase;

    public function test_devices_page_can_be_rendered(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('devices.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('devices/index')
            ->has('devices')
            ->has('deviceTypes')
            ->has('tenants')
        );
    }

    public function test_device_create_page_can_be_rendered(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('devices.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('devices/create')
            ->has('deviceTypes')
            ->has('tenants')
            ->has('vehicles')
        );
    }

    public function test_device_can_be_created(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();

        $deviceData = [
            'device_type_id' => $deviceType->id,
            'serial_number' => 'TEST-1234',
            'sim_number' => '12345678',
            'imei' => '123456789012345',
        ];

        $response = $this
            ->actingAs($user)
            ->post(route('devices.store'), $deviceData);

        $response->assertRedirect(route('devices.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('devices', [
            'serial_number' => 'TEST-1234',
            'sim_number' => '12345678',
            'imei' => '123456789012345',
        ]);
    }

    public function test_device_show_page_can_be_rendered(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('devices.show', $device));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('devices/show')
            ->has('device')
        );
    }

    public function test_device_edit_page_can_be_rendered(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('devices.edit', $device));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('devices/edit')
            ->has('device')
            ->has('deviceTypes')
            ->has('tenants')
            ->has('vehicles')
        );
    }

    public function test_device_can_be_updated(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
        ]);

        $updatedData = [
            'device_type_id' => $deviceType->id,
            'serial_number' => 'UPDATED-1234',
            'sim_number' => '87654321',
            'imei' => '543210987654321',
        ];

        $response = $this
            ->actingAs($user)
            ->put(route('devices.update', $device), $updatedData);

        $response->assertRedirect(route('devices.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'serial_number' => 'UPDATED-1234',
            'sim_number' => '87654321',
            'imei' => '543210987654321',
        ]);
    }

    public function test_device_can_be_deleted(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(route('devices.destroy', $device));

        $response->assertRedirect(route('devices.index'));
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('devices', [
            'id' => $device->id,
        ]);
    }

    public function test_device_can_be_restored(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
        ]);

        $device->delete();

        $response = $this
            ->actingAs($user)
            ->put(route('devices.restore', $device));

        $response->assertRedirect(route('devices.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'deleted_at' => null,
        ]);
    }

    public function test_device_can_be_assigned_to_vehicle(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
            'vehicle_id' => null,
        ]);
        $vehicle = Vehicle::factory()->create();

        $response = $this
            ->actingAs($user)
            ->put(route('devices.assign-vehicle', $device), [
                'vehicle_id' => $vehicle->id,
            ]);

        $response->assertRedirect(route('devices.show', $device));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function test_device_can_be_unassigned_from_vehicle(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $deviceType = DeviceType::factory()->create();
        $vehicle = Vehicle::factory()->create();
        $device = Device::factory()->create([
            'device_type_id' => $deviceType->id,
            'vehicle_id' => $vehicle->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->put(route('devices.unassign-vehicle', $device));

        $response->assertRedirect(route('devices.show', $device));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('devices', [
            'id' => $device->id,
            'vehicle_id' => null,
        ]);
    }
} 