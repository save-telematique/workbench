<?php

namespace Tests\Feature\Policies;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        
        // Create necessary permissions
        Permission::create(['name' => 'view_users']);
        Permission::create(['name' => 'create_users']);
        Permission::create(['name' => 'edit_users']);
        Permission::create(['name' => 'delete_users']);
        
        // Create roles
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());
        
        $centralAdmin = Role::create(['name' => 'central_admin']);
        $centralAdmin->givePermissionTo(['view_users', 'create_users', 'edit_users', 'delete_users']);
        
        $centralUser = Role::create(['name' => 'central_user']);
        $centralUser->givePermissionTo(['view_users']);
    }
    
    /** @test */
    public function super_admin_can_view_users()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        
        $user = User::factory()->create();
        
        $this->assertTrue($superAdmin->can('view', $user));
    }
    
    /** @test */
    public function super_admin_can_create_users()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        
        $this->assertTrue($superAdmin->can('create', User::class));
    }
    
    /** @test */
    public function super_admin_can_update_users()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        
        $user = User::factory()->create();
        
        $this->assertTrue($superAdmin->can('update', $user));
    }
    
    /** @test */
    public function super_admin_can_delete_users()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        
        $user = User::factory()->create();
        
        $this->assertTrue($superAdmin->can('delete', $user));
    }
    
    /** @test */
    public function central_admin_can_view_users()
    {
        $centralAdmin = User::factory()->create();
        $centralAdmin->assignRole('central_admin');
        
        $user = User::factory()->create();
        
        $this->assertTrue($centralAdmin->can('view', $user));
    }
    
    /** @test */
    public function central_user_can_view_but_not_edit_users()
    {
        $centralUser = User::factory()->create();
        $centralUser->assignRole('central_user');
        
        $user = User::factory()->create();
        
        $this->assertTrue($centralUser->can('view', $user));
        $this->assertFalse($centralUser->can('update', $user));
        $this->assertFalse($centralUser->can('delete', $user));
    }
    
    /** @test */
    public function user_cannot_delete_themselves()
    {
        $user = User::factory()->create();
        $user->assignRole('central_admin');
        
        // User with delete permission still can't delete themselves
        $this->assertFalse($user->can('delete', $user));
    }
} 