<?php

namespace Tests\Feature\Groups;

use App\Models\Group;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Driver;
use Tests\TestCase;

class GroupTest extends TestCase
{
    protected Tenant $tenant;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed permissions and roles
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        
        // Create a tenant and user for testing
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->user->assignRole('tenant_admin');
    }

    public function test_can_create_group()
    {
        $groupData = [
            'name' => 'Test Group',
            'description' => 'A test group',
            'color' => '#FF0000',
            'is_active' => true,
        ];

        $group = Group::create(array_merge($groupData, ['tenant_id' => $this->tenant->id]));

        $this->assertDatabaseHas('groups', [
            'name' => 'Test Group',
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $this->assertEquals('Test Group', $group->name);
        $this->assertEquals($this->tenant->id, $group->tenant_id);
    }

    public function test_can_create_hierarchical_groups()
    {
        $parentGroup = Group::factory()->create([
            'name' => 'Parent Group',
            'tenant_id' => $this->tenant->id,
        ]);

        $childGroup = Group::factory()->create([
            'name' => 'Child Group',
            'parent_id' => $parentGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);

        $this->assertEquals($parentGroup->id, $childGroup->parent_id);
        $this->assertTrue($childGroup->parent->is($parentGroup));
        $this->assertTrue($parentGroup->children->contains($childGroup));
    }

    public function test_group_full_path_attribute()
    {
        $parentGroup = Group::factory()->create([
            'name' => 'Parent',
            'tenant_id' => $this->tenant->id,
        ]);

        $childGroup = Group::factory()->create([
            'name' => 'Child',
            'parent_id' => $parentGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);

        $grandchildGroup = Group::factory()->create([
            'name' => 'Grandchild',
            'parent_id' => $childGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);

        $this->assertEquals('Parent > Child > Grandchild', $grandchildGroup->full_path);
    }

    public function test_group_descendant_ids()
    {
        $parentGroup = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        $childGroup1 = Group::factory()->create([
            'parent_id' => $parentGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);
        $childGroup2 = Group::factory()->create([
            'parent_id' => $parentGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);
        $grandchildGroup = Group::factory()->create([
            'parent_id' => $childGroup1->id,
            'tenant_id' => $this->tenant->id,
        ]);

        $descendantIds = $parentGroup->getAllDescendantIds();

        $this->assertContains($parentGroup->id, $descendantIds);
        $this->assertContains($childGroup1->id, $descendantIds);
        $this->assertContains($childGroup2->id, $descendantIds);
        $this->assertContains($grandchildGroup->id, $descendantIds);
    }

    public function test_user_can_access_group_resources()
    {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Assign user to group
        $this->user->groups()->attach($group);

        $vehicle = Vehicle::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => $group->id,
        ]);

        $this->assertTrue($this->user->canAccessResourceGroup($group->id));
        $this->assertTrue($this->user->canAccessResourceGroup(null)); // Always can access groupless resources
    }

    public function test_user_can_access_descendant_group_resources()
    {
        $parentGroup = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        $childGroup = Group::factory()->create([
            'parent_id' => $parentGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);

        // Assign user to parent group
        $this->user->groups()->attach($parentGroup);

        // User should have access to child group resources
        $this->assertTrue($this->user->canAccessResourceGroup($childGroup->id));
    }

    public function test_cannot_delete_group_with_children()
    {
        $parentGroup = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        $childGroup = Group::factory()->create([
            'parent_id' => $parentGroup->id,
            'tenant_id' => $this->tenant->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage(__('groups.errors.has_children'));

        app(\App\Actions\Groups\DeleteGroupAction::class)->handle($parentGroup);
    }

    public function test_cannot_delete_group_with_vehicles()
    {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        
        Vehicle::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => $group->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage(__('groups.errors.has_vehicles'));

        app(\App\Actions\Groups\DeleteGroupAction::class)->handle($group);
    }

    public function test_cannot_delete_group_with_drivers()
    {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        
        Driver::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => $group->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage(__('groups.errors.has_drivers'));

        app(\App\Actions\Groups\DeleteGroupAction::class)->handle($group);
    }

    public function test_group_policy_tenant_isolation()
    {
        $otherTenant = Tenant::factory()->create();
        $otherGroup = Group::factory()->create(['tenant_id' => $otherTenant->id]);

        $this->assertFalse($this->user->can('view', $otherGroup));
        $this->assertFalse($this->user->can('update', $otherGroup));
        $this->assertFalse($this->user->can('delete', $otherGroup));
    }

    public function test_vehicle_policy_respects_group_access()
    {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        $vehicle = Vehicle::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => $group->id,
        ]);

        // User without group access should not be able to access vehicle
        $this->assertFalse($this->user->can('view', $vehicle));

        // Assign user to group
        $this->user->groups()->attach($group);
        $this->user->refresh(); // Refresh to clear cached relationships

        // Now user should have access
        $this->assertTrue($this->user->can('view', $vehicle));
    }

    public function test_driver_policy_respects_group_access()
    {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        $driver = Driver::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => $group->id,
        ]);

        // User without group access should not be able to access driver
        $this->assertFalse($this->user->can('view', $driver));

        // Assign user to group
        $this->user->groups()->attach($group);
        $this->user->refresh(); // Refresh to clear cached relationships

        // Now user should have access
        $this->assertTrue($this->user->can('view', $driver));
    }

    public function test_can_access_groupless_resources()
    {
        $vehicle = Vehicle::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => null, // No group assigned
        ]);

        $driver = Driver::factory()->create([
            'tenant_id' => $this->tenant->id,
            'group_id' => null, // No group assigned
        ]);

        // Users should always be able to access groupless resources
        $this->assertTrue($this->user->can('view', $vehicle));
        $this->assertTrue($this->user->can('view', $driver));
    }

    public function test_tenant_is_required_for_central_users_create()
    {
        // Create a central user (no tenant_id)
        /** @var User $centralUser */
        $centralUser = User::factory()->create(['tenant_id' => null]);
        $centralUser->assignRole('super_admin');
        
        $response = $this->actingAs($centralUser)
            ->post(route('groups.store'), [
                'name' => 'Test Group',
                'description' => 'Test Description',
                'is_active' => true,
                // Missing tenant_id
            ]);
            
        $response->assertSessionHasErrors(['tenant_id']);
    }

    public function test_tenant_is_automatically_set_for_tenant_users_create()
    {
        $response = $this->actingAs($this->user)
            ->post(route('groups.store'), [
                'name' => 'Test Group',
                'description' => 'Test Description',
                'tenant_id' => $this->tenant->id, // Include tenant_id (will be overridden by action)
                'is_active' => true,
            ]);
            
        $response->assertRedirect(route('groups.show', Group::where('name', 'Test Group')->first()));
        
        $this->assertDatabaseHas('groups', [
            'name' => 'Test Group',
            'tenant_id' => $this->tenant->id,
        ]);
    }

    public function test_tenant_cannot_be_changed_on_update()
    {
        $group = Group::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Add a child group to trigger the validation
        Group::factory()->create([
            'parent_id' => $group->id,
            'tenant_id' => $this->tenant->id,
        ]);
        
        $otherTenant = Tenant::factory()->create();
        
        /** @var User $centralUser */
        $centralUser = User::factory()->create(['tenant_id' => null]);
        $centralUser->assignRole('super_admin');
        
        // Use the controller route instead of calling action directly
        $response = $this->actingAs($centralUser)
            ->put(route('groups.update', $group), [
                'name' => 'Updated Group',
                'description' => 'Updated Description',
                'tenant_id' => $otherTenant->id, // Try to change tenant
                'is_active' => true,
            ]);
            
        // Should return with validation error or redirect with error
        $response->assertStatus(302); // Redirect back with errors
        $response->assertSessionHasErrors(['general']);
        
        // Verify tenant hasn't changed
        $group->refresh();
        $this->assertEquals($this->tenant->id, $group->tenant_id);
    }

    public function test_parent_group_must_belong_to_same_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherGroup = Group::factory()->create(['tenant_id' => $otherTenant->id]);
        
        // Use the controller route instead of calling action directly
        $response = $this->actingAs($this->user)
            ->post(route('groups.store'), [
                'name' => 'Test Group',
                'description' => 'Test Description',
                'parent_id' => $otherGroup->id, // Parent from different tenant
                'tenant_id' => $this->tenant->id,
                'is_active' => true,
            ]);
            
        // Should return with validation error or redirect with error
        $response->assertStatus(302); // Redirect back with errors
        $response->assertSessionHasErrors(['general']);
    }
} 