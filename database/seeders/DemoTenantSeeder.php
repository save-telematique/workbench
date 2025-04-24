<?php

namespace Database\Seeders;

use App\Models\Box;
use App\Models\Device;
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

        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);

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

    }
}
