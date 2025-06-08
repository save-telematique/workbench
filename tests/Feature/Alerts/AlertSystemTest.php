<?php

use App\Actions\Alerts\CreateAlertAction;
use App\Actions\Alerts\GetAlertsAction;
use App\Actions\Alerts\GetUnreadAlertsCountAction;
use App\Models\Alert;
use App\Models\Group;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Alert System with Auto-Assignment', function () {
    beforeEach(function () {
        $this->tenant = Tenant::factory()->create();
        $this->vehicle = Vehicle::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Create users with different roles
        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('super_admin');
        
        $this->tenantAdmin = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->tenantAdmin->assignRole('tenant_admin');
        
        $this->tenantUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->tenantUser->assignRole('tenant_user');
        
        $this->centralUser = User::factory()->create();
        $this->centralUser->assignRole('central_admin');
    });

    it('automatically assigns alerts to eligible users when created', function () {
        $action = new CreateAlertAction();
        
        $alert = $action->handle([
            'title' => 'Test Vehicle Alert',
            'content' => 'Test content',
            'type' => 'maintenance',
            'severity' => 'warning',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        // Verify alert was created
        expect($alert)->toBeInstanceOf(Alert::class);
        expect($alert->title)->toBe('Test Vehicle Alert');

        // Verify assignments were created
        $assignedUserIds = $alert->users()->pluck('user_id')->toArray();
        
        // Super admin should be assigned
        expect($assignedUserIds)->toContain($this->superAdmin->id);
        
        // Tenant users with view_alerts permission should be assigned
        expect($assignedUserIds)->toContain($this->tenantAdmin->id);
        expect($assignedUserIds)->toContain($this->tenantUser->id);
        
        // Central users should not be assigned to tenant alerts
        expect($assignedUserIds)->not->toContain($this->centralUser->id);
    });

    it('respects group restrictions for vehicle alerts', function () {
        // Create a group and assign vehicle to it
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->vehicle->groups()->attach($group);
        
        // Create a user with group restriction
        $restrictedUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $restrictedUser->assignRole('tenant_user');
        $restrictedUser->groups()->attach($group);
        
        // Create a user without group access
        $unrestrictedUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $unrestrictedUser->assignRole('tenant_user');
        
        $action = new CreateAlertAction();
        
        $alert = $action->handle([
            'title' => 'Group Vehicle Alert',
            'content' => 'Test content',
            'type' => 'maintenance',
            'severity' => 'warning',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $assignedUserIds = $alert->users()->pluck('user_id')->toArray();
        
        // User with group access should be assigned
        expect($assignedUserIds)->toContain($restrictedUser->id);
        
        // User without group access should not be assigned
        expect($assignedUserIds)->not->toContain($unrestrictedUser->id);
        
        // Admin users should still be assigned (they see all)
        expect($assignedUserIds)->toContain($this->tenantAdmin->id);
    });

    it('gets alerts for user with proper filtering', function () {
        // Create multiple alerts
        $action = new CreateAlertAction();
        
        $alert1 = $action->handle([
            'title' => 'Alert 1',
            'content' => 'Content 1',
            'type' => 'maintenance',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);
        
        $alert2 = $action->handle([
            'title' => 'Alert 2',
            'content' => 'Content 2',
            'type' => 'security',
            'severity' => 'error',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $getAlertsAction = new GetAlertsAction();
        
        // Get all alerts for tenant admin
        $alerts = $getAlertsAction->handle(user: $this->tenantAdmin);
        expect($alerts->total())->toBe(2);
        
        // Filter by severity
        $errorAlerts = $getAlertsAction->handle(
            user: $this->tenantAdmin,
            filters: ['severity' => 'error']
        );
        expect($errorAlerts->total())->toBe(1);
        expect($errorAlerts->items()[0]->title)->toBe('Alert 2');
        
        // Filter by search
        $searchAlerts = $getAlertsAction->handle(
            user: $this->tenantAdmin,
            filters: ['search' => 'Alert 1']
        );
        expect($searchAlerts->total())->toBe(1);
        expect($searchAlerts->items()[0]->title)->toBe('Alert 1');
    });

    it('counts unread alerts correctly', function () {
        $action = new CreateAlertAction();
        
        // Create alerts
        $alert1 = $action->handle([
            'title' => 'Unread Alert 1',
            'content' => 'Content 1',
            'type' => 'maintenance',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);
        
        $alert2 = $action->handle([
            'title' => 'Unread Alert 2',
            'content' => 'Content 2',
            'type' => 'security',
            'severity' => 'warning',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $countAction = new GetUnreadAlertsCountAction();
        
        // Initially all alerts should be unread
        $unreadCount = $countAction->handle($this->tenantAdmin);
        expect($unreadCount)->toBe(2);
        
        // Mark one as read
        $alert1->users()->updateExistingPivot($this->tenantAdmin->id, ['read_at' => now()]);
        
        // Count should decrease
        $unreadCount = $countAction->handle($this->tenantAdmin);
        expect($unreadCount)->toBe(1);
    });

    it('prevents manual alert creation through routes', function () {
        // Verify create and store routes are removed
        $this->actingAs($this->tenantAdmin)
            ->get(route('alerts.index'))
            ->assertOk();
            
        // These routes should not exist anymore
        expect(function () {
            route('alerts.create');
        })->toThrow(Exception::class);
        
        expect(function () {
            route('alerts.store');
        })->toThrow(Exception::class);
    });

    it('allows viewing and marking alerts as read/unread', function () {
        $action = new CreateAlertAction();
        
        $alert = $action->handle([
            'title' => 'Test Alert',
            'content' => 'Test content',
            'type' => 'maintenance',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        // View alert
        $this->actingAs($this->tenantAdmin)
            ->get(route('alerts.show', $alert))
            ->assertOk();
            
        // Mark as read
        $this->actingAs($this->tenantAdmin)
            ->post(route('alerts.mark-as-read', $alert))
            ->assertRedirect();
            
        // Verify it's marked as read
        $pivot = $alert->users()->where('user_id', $this->tenantAdmin->id)->first()->pivot;
        expect($pivot->read_at)->not->toBeNull();
        
        // Mark as unread
        $this->actingAs($this->tenantAdmin)
            ->post(route('alerts.mark-as-unread', $alert))
            ->assertRedirect();
            
        // Verify it's marked as unread
        $pivot = $alert->users()->where('user_id', $this->tenantAdmin->id)->first()->pivot;
        expect($pivot->read_at)->toBeNull();
    });

    it('provides unread count via API', function () {
        $action = new CreateAlertAction();
        
        $action->handle([
            'title' => 'API Test Alert',
            'content' => 'Test content',
            'type' => 'maintenance',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $this->vehicle->id,
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->tenantAdmin)
            ->get(route('api.alerts.unread-count'))
            ->assertOk()
            ->assertJson(['unread_count' => 1]);
    });
}); 