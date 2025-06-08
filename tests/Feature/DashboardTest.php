<?php

use App\Models\User;
use App\Models\Alert;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed permissions and roles
    $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PermissionSeeder']);
});

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('super_admin'); // Ensure user has permissions to view alerts

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => 
            $page->component('dashboard')
                ->has('recentAlerts')
        );
});

test('dashboard includes recent alerts for users with view_alerts permission', function () {
    $user = User::factory()->create();
    $user->assignRole('super_admin'); // Super admin has all permissions including view_alerts
    
    // Create some test alerts for the user
    $alerts = Alert::factory()
        ->count(3)
        ->create(['tenant_id' => $user->tenant_id]);
    
    // Assign alerts to the user
    foreach ($alerts as $alert) {
        $alert->users()->attach($user->id);
    }

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => 
            $page->component('dashboard')
                ->has('recentAlerts')
                ->has('recentAlerts', 3)
        );
});

test('dashboard shows empty alerts for users without view_alerts permission', function () {
    $user = User::factory()->create();
    // Don't assign any role, so user has no permissions
    
    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => 
            $page->component('dashboard')
                ->has('recentAlerts')
                ->has('recentAlerts', 0)
        );
});