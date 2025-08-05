<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define resources/models to generate permissions for
        $resources = [
            'users',
            'tenants',
            'tenant_users',
            'tenant_domains',
            'vehicles',
            'vehicle_brands',
            'vehicle_models',
            'vehicle_types',
            'devices',
            'device_types',
            'device_messages',
            'drivers',
            'groups',
            'geofences',
            'workflows',
            'alerts',
            'global_settings',
        ];

        // Create permissions for each resource
        foreach ($resources as $resource) {
            // CRUD permissions
            Permission::firstOrCreate(['name' => "view_{$resource}", 'guard_name' => 'web']);
            Permission::firstOrCreate(['name' => "create_{$resource}", 'guard_name' => 'web']);
            // Alerts cannot be edited, only created and deleted
            if ($resource !== 'alerts') {
                Permission::firstOrCreate(['name' => "edit_{$resource}", 'guard_name' => 'web']);
            }
            Permission::firstOrCreate(['name' => "delete_{$resource}", 'guard_name' => 'web']);
        }

        // Central roles
        $centralRoles = [
            'super_admin' => 'Super Administrator with full access',
            'central_admin' => 'Central Administrator with most access',
            'central_user' => 'Central standard user'
        ];

        // Tenant roles
        $tenantRoles = [
            'tenant_admin' => 'Tenant Administrator with full tenant access',
            'tenant_manager' => 'Tenant Manager with extensive access',
            'tenant_user' => 'Tenant standard user',
            'tenant_viewer' => 'Tenant user with view-only access',
        ];

        // Create central roles
        foreach ($centralRoles as $role => $description) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create tenant roles
        foreach ($tenantRoles as $role => $description) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Assign permissions to roles

        // Super Admin gets all permissions
        $superAdmin = Role::findByName('super_admin');
        $superAdmin->givePermissionTo(Permission::all());

        // Central Admin gets all permissions except some tenant management
        $centralAdmin = Role::findByName('central_admin');
        $centralAdmin->givePermissionTo(Permission::all()->except(['delete_tenants']));

        // Central User permissions
        $centralUser = Role::findByName('central_user');
        $centralUser->givePermissionTo([
            'view_tenants', 
            'view_users',
        ]);

        // Tenant Admin permissions
        $tenantAdmin = Role::findByName('tenant_admin');
        $tenantAdmin->givePermissionTo([
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_tenant_users', 'create_tenant_users', 'edit_tenant_users', 'delete_tenant_users',
            'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles',
            'view_devices', 'create_devices', 'edit_devices', 'delete_devices',
            'view_drivers', 'create_drivers', 'edit_drivers', 'delete_drivers',
            'view_groups', 'create_groups', 'edit_groups', 'delete_groups',
            'view_geofences', 'create_geofences', 'edit_geofences', 'delete_geofences',
            'view_workflows', 'create_workflows', 'edit_workflows', 'delete_workflows',
            'view_alerts', 'create_alerts', 'delete_alerts',
        ]);

        // Tenant Manager permissions
        $tenantManager = Role::findByName('tenant_manager');
        $tenantManager->givePermissionTo([
            'view_users',
            'view_tenant_users', 'edit_tenant_users',
            'view_tenant_domains',
            'view_vehicles', 'create_vehicles', 'edit_vehicles',
            'view_devices', 'create_devices', 'edit_devices',
            'view_drivers', 'create_drivers', 'edit_drivers',
            'view_groups', 'create_groups', 'edit_groups',
            'view_geofences', 'create_geofences', 'edit_geofences',
            'view_workflows', 'create_workflows', 'edit_workflows',
            'view_alerts', 'create_alerts',
        ]);

        // Tenant User permissions
        $tenantUser = Role::findByName('tenant_user');
        $tenantUser->givePermissionTo([
            'view_vehicles', 'edit_vehicles',
            'view_devices',
            'view_drivers', 'edit_drivers',
            'view_groups',
            'view_geofences',
            'view_workflows',
            'view_alerts',
        ]);

        // Tenant Viewer permissions
        $tenantViewer = Role::findByName('tenant_viewer');
        $tenantViewer->givePermissionTo([
            'view_vehicles',
            'view_devices',
            'view_drivers',
            'view_groups',
            'view_geofences',
            'view_workflows',
            'view_alerts',
        ]);
    }
} 