<?php

namespace Tests\Feature\Policies;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class VehiclePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant1;
    protected Tenant $tenant2;

    public function setUp(): void
    {
        parent::setUp();
        
        // Create tenants
        $this->tenant1 = Tenant::factory()->create(['id' => 'tenant1']);
        $this->tenant2 = Tenant::factory()->create(['id' => 'tenant2']);
        
        // Create necessary permissions
        Permission::create(['name' => 'view_vehicles']);
        Permission::create(['name' => 'create_vehicles']);
        Permission::create(['name' => 'edit_vehicles']);
        Permission::create(['name' => 'delete_vehicles']);
        
        // Create roles
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());
        
        $centralAdmin = Role::create(['name' => 'central_admin']);
        $centralAdmin->givePermissionTo(['view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles']);
        
        $tenantAdmin = Role::create(['name' => 'tenant_admin']);
        $tenantAdmin->givePermissionTo(['view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles']);
        
        $tenantUser = Role::create(['name' => 'tenant_user']);
        $tenantUser->givePermissionTo(['view_vehicles', 'edit_vehicles']);
        
        $tenantViewer = Role::create(['name' => 'tenant_viewer']);
        $tenantViewer->givePermissionTo(['view_vehicles']);
    }
    
    /** @test */
    public function central_users_can_access_all_vehicles()
    {
        $centralAdmin = User::factory()->create();
        $centralAdmin->assignRole('central_admin');
        
        $vehicle1 = Vehicle::factory()->create(['tenant_id' => $this->tenant1->id]);
        $vehicle2 = Vehicle::factory()->create(['tenant_id' => $this->tenant2->id]);
        
        $this->assertTrue($centralAdmin->can('view', $vehicle1));
        $this->assertTrue($centralAdmin->can('view', $vehicle2));
        $this->assertTrue($centralAdmin->can('update', $vehicle1));
        $this->assertTrue($centralAdmin->can('update', $vehicle2));
        $this->assertTrue($centralAdmin->can('delete', $vehicle1));
        $this->assertTrue($centralAdmin->can('delete', $vehicle2));
    }
    
    /** @test */
    public function tenant_users_can_only_access_their_own_tenant_vehicles()
    {
        // Create tenant users
        $tenantUser1 = User::factory()->create(['tenant_id' => $this->tenant1->id]);
        $tenantUser1->assignRole('tenant_user');
        
        $tenantUser2 = User::factory()->create(['tenant_id' => $this->tenant2->id]);
        $tenantUser2->assignRole('tenant_user');
        
        // Create vehicles
        $vehicle1 = Vehicle::factory()->create(['tenant_id' => $this->tenant1->id]);
        $vehicle2 = Vehicle::factory()->create(['tenant_id' => $this->tenant2->id]);
        
        // Test tenant1 user access
        $this->assertTrue($tenantUser1->can('view', $vehicle1));
        $this->assertFalse($tenantUser1->can('view', $vehicle2));
        $this->assertTrue($tenantUser1->can('update', $vehicle1));
        $this->assertFalse($tenantUser1->can('update', $vehicle2));
        
        // Test tenant2 user access
        $this->assertTrue($tenantUser2->can('view', $vehicle2));
        $this->assertFalse($tenantUser2->can('view', $vehicle1));
        $this->assertTrue($tenantUser2->can('update', $vehicle2));
        $this->assertFalse($tenantUser2->can('update', $vehicle1));
    }
    
    /** @test */
    public function tenant_admin_can_delete_only_their_tenant_vehicles()
    {
        // Create tenant users with admin role
        $tenantAdmin1 = User::factory()->create(['tenant_id' => $this->tenant1->id]);
        $tenantAdmin1->assignRole('tenant_admin');
        
        // Create vehicles
        $vehicle1 = Vehicle::factory()->create(['tenant_id' => $this->tenant1->id]);
        $vehicle2 = Vehicle::factory()->create(['tenant_id' => $this->tenant2->id]);
        
        // Test tenant1 admin access
        $this->assertTrue($tenantAdmin1->can('delete', $vehicle1));
        $this->assertFalse($tenantAdmin1->can('delete', $vehicle2));
    }
    
    /** @test */
    public function tenant_viewer_can_view_but_not_edit_vehicles()
    {
        $tenantViewer = User::factory()->create(['tenant_id' => $this->tenant1->id]);
        $tenantViewer->assignRole('tenant_viewer');
        
        $vehicle = Vehicle::factory()->create(['tenant_id' => $this->tenant1->id]);
        
        $this->assertTrue($tenantViewer->can('view', $vehicle));
        $this->assertFalse($tenantViewer->can('update', $vehicle));
        $this->assertFalse($tenantViewer->can('delete', $vehicle));
    }
} 