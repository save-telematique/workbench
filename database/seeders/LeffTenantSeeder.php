<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class LeffTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::create([
            'name' => 'Leff Combustibles',
        ]);

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

        $tenant->domains()->create([
            'domain' => 'leff',
        ]);

        $vehicle1 = Vehicle::create([
            'id' => "9d00c39b-04b3-4940-8761-67b1e9e0ecd2",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1,
            'vehicle_model_id' => 1,
            'registration' => 'GW-033-PL',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $vehicle2 = Vehicle::create([
            'id' => "8d00c39b-04b3-4940-8761-67b1e9e0ecd2",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 2,
            'vehicle_model_id' => 2,
            'registration' => 'DZ-453-QT',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $device1 = Device::create([
            'id' => "9c90477c-adb6-40d5-be98-05149ffbfc7a",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1,
            'imei' => '863719061268919',
            'sim_number' => '8944477100001265415',
            'serial_number' => '0000000000000001',
            'vehicle_id' => $vehicle1->id,
        ]);

        $device2 = Device::create([
            'id' => "8c90477c-adb6-40d5-be98-05149ffbfc7a",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1,
            'imei' => '863719061175445',
            'sim_number' => '8944477100001265423',
            'serial_number' => '0000000000000002',
            'vehicle_id' => $vehicle2->id,
        ]);
    }
}
