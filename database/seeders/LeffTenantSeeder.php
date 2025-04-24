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

        User::factory()->create([
            'name' => 'Leff Combustibles',
            'email' => 'leff@save.test',
            'tenant_id' => $tenant->id,
            'password' => bcrypt('password'),
        ]);


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
