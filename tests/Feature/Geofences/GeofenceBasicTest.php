<?php

use App\Models\Geofence;
use App\Models\Group;
use App\Models\Tenant;
use App\Models\User;

test('geofence model can be created', function () {
    $tenant = Tenant::factory()->create();
    $group = Group::factory()->create(['tenant_id' => $tenant->id]);
    
    $geofence = Geofence::factory()->create([
        'tenant_id' => $tenant->id,
        'group_id' => $group->id,
        'name' => 'Test Zone',
    ]);

    expect($geofence->name)->toBe('Test Zone');
    expect($geofence->tenant_id)->toBe($tenant->id);
    expect($geofence->group_id)->toBe($group->id);
    expect($geofence->is_active)->toBeTrue();
    expect($geofence->geojson)->toBeArray();
});

test('geofence belongs to tenant', function () {
    $tenant = Tenant::factory()->create();
    $geofence = Geofence::factory()->create(['tenant_id' => $tenant->id]);

    expect($geofence->tenant)->toBeInstanceOf(Tenant::class);
    expect($geofence->tenant->id)->toBe($tenant->id);
});

test('geofence can belong to group', function () {
    $tenant = Tenant::factory()->create();
    $group = Group::factory()->create(['tenant_id' => $tenant->id]);
    $geofence = Geofence::factory()->create([
        'tenant_id' => $tenant->id,
        'group_id' => $group->id,
    ]);

    expect($geofence->group)->toBeInstanceOf(Group::class);
    expect($geofence->group->id)->toBe($group->id);
});

test('geofence can be active or inactive', function () {
    $tenant = Tenant::factory()->create();
    
    $activeGeofence = Geofence::factory()->active()->create(['tenant_id' => $tenant->id]);
    $inactiveGeofence = Geofence::factory()->inactive()->create(['tenant_id' => $tenant->id]);

    expect($activeGeofence->is_active)->toBeTrue();
    expect($inactiveGeofence->is_active)->toBeFalse();
});

test('geofence scope active works', function () {
    $tenant = Tenant::factory()->create();
    
    Geofence::factory()->active()->create(['tenant_id' => $tenant->id]);
    Geofence::factory()->inactive()->create(['tenant_id' => $tenant->id]);

    $activeGeofences = Geofence::active()->get();
    
    expect($activeGeofences)->toHaveCount(1);
    expect($activeGeofences->first()->is_active)->toBeTrue();
}); 