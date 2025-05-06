<?php

namespace Tests\Feature\Policies;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class TenantPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        
        // Create necessary permissions
        Permission::create(['name' => 'view_tenants']);
        Permission::create(['name' => 'create_tenants']);
        Permission::create(['name' => 'edit_tenants']);
        Permission::create(['name' => 'delete_tenants']);
        
        // Create roles
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());
        
        $centralAdmin = Role::create(['name' => 'central_admin']);
        $centralAdmin->givePermissionTo(['view_tenants', 'create_tenants', 'edit_tenants']);
        
        $centralUser = Role::create(['name' => 'central_user']);
        $centralUser->givePermissionTo(['view_tenants']);
        
        $tenantAdmin = Role::create(['name' => 'tenant_admin']);
    }
    
    /** @test */
    public function super_admin_can_manage_tenants()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        
        $tenant = Tenant::factory()->create();
        
        $this->assertTrue($superAdmin->can('view', $tenant));
        $this->assertTrue($superAdmin->can('create', Tenant::class));
        $this->assertTrue($superAdmin->can('update', $tenant));
        $this->assertTrue($superAdmin->can('delete', $tenant));
    }
    
    /** @test */
    public function central_admin_cannot_delete_tenants()
    {
        $centralAdmin = User::factory()->create();
        $centralAdmin->assignRole('central_admin');
        
        $tenant = Tenant::factory()->create();
        
        $this->assertTrue($centralAdmin->can('view', $tenant));
        $this->assertTrue($centralAdmin->can('create', Tenant::class));
        $this->assertTrue($centralAdmin->can('update', $tenant));
        $this->assertFalse($centralAdmin->can('delete', $tenant));
    }
    
    /** @test */
    public function central_user_can_only_view_tenants()
    {
        $centralUser = User::factory()->create();
        $centralUser->assignRole('central_user');
        
        $tenant = Tenant::factory()->create();
        
        $this->assertTrue($centralUser->can('view', $tenant));
        $this->assertFalse($centralUser->can('create', Tenant::class));
        $this->assertFalse($centralUser->can('update', $tenant));
        $this->assertFalse($centralUser->can('delete', $tenant));
    }
    
    /** @test */
    public function tenant_users_cannot_manage_tenants()
    {
        $tenant = Tenant::factory()->create();
        $tenantAdmin = User::factory()->create(['tenant_id' => $tenant->id]);
        $tenantAdmin->assignRole('tenant_admin');
        
        $this->assertFalse($tenantAdmin->can('view', $tenant));
        $this->assertFalse($tenantAdmin->can('create', Tenant::class));
        $this->assertFalse($tenantAdmin->can('update', $tenant));
        $this->assertFalse($tenantAdmin->can('delete', $tenant));
    }
} 