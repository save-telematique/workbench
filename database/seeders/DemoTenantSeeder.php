<?php

namespace Database\Seeders;

use App\Models\Box;
use App\Models\Device;
use App\Models\Driver;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::create([
            'name' => 'Save Demo',
        ]);

        // Create user and assign tenant_admin role
        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);
        
        // Assign tenant_admin role to the user
        $user->assignRole('tenant_admin');

        // Create a second user with tenant_viewer role
        $viewerUser = User::factory()->create([
            'name' => 'Demo Viewer',
            'email' => 'demo-viewer@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);
        
        // Assign tenant_viewer role to the viewer user
        $viewerUser->assignRole('tenant_viewer');

        $tenant->domains()->create([
            'domain' => 'demo',
        ]);

        Vehicle::create([
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1,
            'vehicle_model_id' => 1,
            'registration' => 'FB-114-DD',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $device2 = Device::create([
            'device_type_id' => 1,
            'imei' => 'XXXXXX',
            'sim_number' => 'XXXXX',
            'serial_number' => 'XX',
        ]);

        Driver::create([
            'tenant_id' => $tenant->id,
            'surname' => 'Nom',
            'firstname' => 'Prénom',
            'card_issuing_country' => 'FR',
            'card_number' => '7000000120049447',
            'license_number' => '1234567890',
            'birthdate' => '1990-01-01',
            'card_issuing_date' => '2020-01-01',
            'card_expiration_date' => '2025-01-01',
        ]);
    }
}
