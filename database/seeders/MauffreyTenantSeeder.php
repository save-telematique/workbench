<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class MauffreyTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::create([
            'name' => 'Mauffrey',
        ]);

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

        $tenant->domains()->create([
            'domain' => 'mauffrey',
        ]);


        $vehicle1 = Vehicle::create([
            'id' => "6ba4031b-f65d-4989-91ec-af8bb8f9f43f",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1,
            'vehicle_model_id' => 3,
            'registration' => 'GZ-605-XM',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $vehicle2 = Vehicle::create([
            'id' => "1fe4eb9d-08d6-4942-9fcf-3c39012fbcd7",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1,
            'vehicle_model_id' => 3,
            'registration' => 'GZ-696-TM',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $vehicle3 = Vehicle::create([
            'id' => "7f62d3b3-137c-41ca-9af3-cb18400e599c",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 3,
            'vehicle_model_id' => 3,
            'registration' => 'GZ-227-VN',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $device1 = Device::create([
            'id' => "0413fef3-e2dc-4cf9-bc5d-58e1ef75568e",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1,
            'imei' => '864275075637333',
            'sim_number' => 'XX',
            'serial_number' => 'XX',
            'vehicle_id' => $vehicle1->id,
        ]);

        $device2 = Device::create([
            'id' => "6265667a-d196-4332-bff9-0ce2d9b1c69d",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1,
            'imei' => '864275075564677',
            'sim_number' => 'XX',
            'serial_number' => 'XX',
            'vehicle_id' => $vehicle2->id,
        ]);

        $device3 = Device::create([
            'id' => "f47f8b8c-a1c9-4271-a7e6-90b0f36dc22b",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1,
            'imei' => '864275075891369',
            'sim_number' => 'XX',
            'serial_number' => 'XX',
            'vehicle_id' => $vehicle3->id,
        ]);
    }
}
