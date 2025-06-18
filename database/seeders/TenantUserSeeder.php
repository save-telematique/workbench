<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class TenantUserSeeder extends Seeder
{
    public function run(): void
    {

        $tenant = Tenant::where('name', 'Mauffrey')->first();
        // Create admin user and assign tenant_admin role
        $adminUser = User::factory()->create([
            'name' => 'Mauffrey Admin',
            'email' => 'mauffrey@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_admin role to the admin user
        $adminUser->assignRole('tenant_admin');

        // Create manager user and assign tenant_manager role
        $managerUser = User::factory()->create([
            'name' => 'Mauffrey Manager',
            'email' => 'mauffrey-manager@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_manager role to the manager user
        $managerUser->assignRole('tenant_manager');

        // Create standard user and assign tenant_user role
        $standardUser = User::factory()->create([
            'name' => 'Mauffrey User',
            'email' => 'mauffrey-user@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_user role to the standard user
        $standardUser->assignRole('tenant_user');

        // Create viewer user and assign tenant_viewer role
        $viewerUser = User::factory()->create([
            'name' => 'Mauffrey Viewer',
            'email' => 'mauffrey-viewer@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_viewer role to the viewer user
        $viewerUser->assignRole('tenant_viewer');

        $tenant = Tenant::where('name', 'Leff Combustibles')->first();


        // Create admin user and assign tenant_admin role
        $adminUser = User::factory()->create([
            'name' => 'Leff Admin',
            'email' => 'leff@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_admin role to the admin user
        $adminUser->assignRole('tenant_admin');

        // Create manager user and assign tenant_manager role
        $managerUser = User::factory()->create([
            'name' => 'Leff Manager',
            'email' => 'leff-manager@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_manager role to the manager user
        $managerUser->assignRole('tenant_manager');

        // Create standard user and assign tenant_user role
        $standardUser = User::factory()->create([
            'name' => 'Leff User',
            'email' => 'leff-user@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_user role to the standard user
        $standardUser->assignRole('tenant_user');

        // Create viewer user and assign tenant_viewer role
        $viewerUser = User::factory()->create([
            'name' => 'Leff Viewer',
            'email' => 'leff-viewer@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

        // Assign tenant_viewer role to the viewer user
        $viewerUser->assignRole('tenant_viewer');
    }
}
