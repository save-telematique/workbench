<?php

use App\Models\Tenant;
use App\Models\User;

test('tenants index page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/tenants');

    $response->assertOk();
});

test('tenant creation page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/tenants/create');

    $response->assertOk();
});

test('tenant can be created', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post('/tenants', [
            'name' => 'Test Tenant',
            'email' => 'test@example.com',
            'phone' => '1234567890',
            'address' => '123 Test Street',
            'is_active' => true,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/tenants');

    $this->assertDatabaseHas('tenants', [
        'name' => 'Test Tenant',
        'email' => 'test@example.com',
    ]);
});

test('tenant edit page is displayed', function () {
    $user = User::factory()->create();
    $tenant = Tenant::create([
        'name' => 'Test Tenant',
        'email' => 'test@example.com',
        'is_active' => true,
    ]);

    $response = $this
        ->actingAs($user)
        ->get("/tenants/{$tenant->id}/edit");

    $response->assertOk();
});

test('tenant can be updated', function () {
    $user = User::factory()->create();
    $tenant = Tenant::create([
        'name' => 'Test Tenant',
        'email' => 'test@example.com',
        'is_active' => true,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch("/tenants/{$tenant->id}", [
            'name' => 'Updated Tenant',
            'email' => 'updated@example.com',
            'phone' => '0987654321',
            'address' => '456 Update Street',
            'is_active' => false,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect("/tenants/{$tenant->id}/edit");

    $this->assertDatabaseHas('tenants', [
        'id' => $tenant->id,
        'name' => 'Updated Tenant',
        'email' => 'updated@example.com',
        'is_active' => false,
    ]);
});

test('tenant can be deleted', function () {
    $user = User::factory()->create();
    $tenant = Tenant::create([
        'name' => 'Test Tenant',
        'email' => 'test@example.com',
        'is_active' => true,
    ]);

    $response = $this
        ->actingAs($user)
        ->delete("/tenants/{$tenant->id}");

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/tenants');

    $this->assertSoftDeleted('tenants', [
        'id' => $tenant->id,
    ]);
}); 