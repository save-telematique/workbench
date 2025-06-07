<?php

use App\Models\Geofence;
use App\Models\Group;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Geofence Management', function () {
    beforeEach(function () {
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->user->assignRole('tenant_admin');
    });

    it('allows tenant admin to view geofences index', function () {
        $geofence = Geofence::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->user)
            ->get(route('geofences.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('geofences/index')
                ->has('geofences.data', 1)
        );
    });

    it('allows tenant admin to create geofences', function () {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        
        $geofenceData = [
            'name' => 'Test Zone',
            'group_id' => $group->id,
            'geojson' => [
                'type' => 'Polygon',
                'coordinates' => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
            ],
            'is_active' => true,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('geofences.store'), $geofenceData);

        $response->assertRedirect();
        $this->assertDatabaseHas('geofences', [
            'name' => 'Test Zone',
            'tenant_id' => $this->tenant->id,
            'group_id' => $group->id,
            'is_active' => true,
        ]);
    });

    it('allows tenant admin to update geofences', function () {
        $geofence = Geofence::factory()->create(['tenant_id' => $this->tenant->id]);
        
        $updateData = [
            'name' => 'Updated Zone',
            'geojson' => [
                'type' => 'Polygon',
                'coordinates' => [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
            ],
            'is_active' => false,
        ];

        $response = $this->actingAs($this->user)
            ->put(route('geofences.update', $geofence), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('geofences', [
            'id' => $geofence->id,
            'name' => 'Updated Zone',
            'is_active' => false,
        ]);
    });

    it('allows tenant admin to delete geofences', function () {
        $geofence = Geofence::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('geofences.destroy', $geofence));

        $response->assertRedirect(route('geofences.index'));
        $this->assertSoftDeleted('geofences', ['id' => $geofence->id]);
    });

    it('prevents tenant users from accessing other tenant geofences', function () {
        $otherTenant = Tenant::factory()->create();
        $otherGeofence = Geofence::factory()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->actingAs($this->user)
            ->get(route('geofences.show', $otherGeofence));

        $response->assertNotFound();
    });

    it('validates geofence creation data', function () {
        $response = $this->actingAs($this->user)
            ->post(route('geofences.store'), [
                'name' => '', // Required field missing
                'geojson' => 'invalid', // Invalid geojson
            ]);

        $response->assertSessionHasErrors(['name', 'geojson']);
    });

    it('enforces group tenant isolation', function () {
        $otherTenant = Tenant::factory()->create();
        $otherGroup = Group::factory()->create(['tenant_id' => $otherTenant->id]);
        
        $geofenceData = [
            'name' => 'Test Zone',
            'group_id' => $otherGroup->id, // Group from different tenant
            'geojson' => [
                'type' => 'Polygon',
                'coordinates' => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
            ],
            'is_active' => true,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('geofences.store'), $geofenceData);

        $response->assertSessionHasErrors(['group_id']);
    });
});

describe('Geofence Permissions', function () {
    beforeEach(function () {
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        
        $this->tenant = Tenant::factory()->create();
        $this->geofence = Geofence::factory()->create(['tenant_id' => $this->tenant->id]);
    });

    it('allows tenant_admin to manage geofences', function () {
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->assignRole('tenant_admin');

        expect($user->can('view', $this->geofence))->toBeTrue();
        expect($user->can('update', $this->geofence))->toBeTrue();
        expect($user->can('delete', $this->geofence))->toBeTrue();
    });

    it('allows tenant_manager to create and edit geofences', function () {
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->assignRole('tenant_manager');

        expect($user->can('view', $this->geofence))->toBeTrue();
        expect($user->can('create', Geofence::class))->toBeTrue();
        expect($user->can('update', $this->geofence))->toBeTrue();
        expect($user->can('delete', $this->geofence))->toBeFalse();
    });

    it('allows tenant_user to view geofences only', function () {
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->assignRole('tenant_user');

        expect($user->can('view', $this->geofence))->toBeTrue();
        expect($user->can('create', Geofence::class))->toBeFalse();
        expect($user->can('update', $this->geofence))->toBeFalse();
        expect($user->can('delete', $this->geofence))->toBeFalse();
    });

    it('prevents cross-tenant access', function () {
        $otherTenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $otherTenant->id]);
        $user->assignRole('tenant_admin');

        expect($user->can('view', $this->geofence))->toBeFalse();
        expect($user->can('update', $this->geofence))->toBeFalse();
        expect($user->can('delete', $this->geofence))->toBeFalse();
    });
}); 