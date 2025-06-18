<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
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

        $tenant->domains()->create([
            'domain' => 'leff',
        ]);

        // Véhicules existants
        $vehicle1 = Vehicle::create([
            'id' => "9d00c39b-04b3-4940-8761-67b1e9e0ecd2",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1,
            'vehicle_model_id' => VehicleModel::where('name', 'FE')->first()->id,
            'registration' => 'GW-033-PL',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        $vehicle2 = Vehicle::create([
            'id' => "8d00c39b-04b3-4940-8761-67b1e9e0ecd2",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 2,
            'vehicle_model_id' => VehicleModel::where('name', 'T')->first()->id,
            'registration' => 'DZ-453-QT',
            'vin' => 'VIN',
            'country' => 'FR',
        ]);

        // Nouveaux véhicules Leff Combustibles - Meurou
        $vehicle3 = Vehicle::create([
            'id' => "1a2b3c4d-5e6f-7890-1234-56789abcdef1",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1, // Tracteur
            'vehicle_model_id' => VehicleModel::where('name', 'FM')->first()->id, // Volvo FM (sera l'ID 2 après le seeder VehicleStaticDataSeeder)
            'registration' => 'FK-753-TZ',
            'vin' => 'YV2RTZ50XMA123456', // VIN exemple pour Volvo
            'country' => 'FR',
        ]);

        $vehicle4 = Vehicle::create([
            'id' => "2b3c4d5e-6f78-9012-3456-789abcdef123",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1, // Tracteur
            'vehicle_model_id' => VehicleModel::where('name', 'T')->first()->id, // Renault T
            'registration' => 'ER-409-EH',
            'vin' => 'VF633RP0H65123456', // VIN exemple pour Renault
            'country' => 'FR',
        ]);

        $vehicle5 = Vehicle::create([
            'id' => "3c4d5e6f-7890-1234-5678-9abcdef12345",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1, // Tracteur
            'vehicle_model_id' => VehicleModel::where('name', 'FM')->first()->id, // Volvo FM
            'registration' => 'FS-100-PR',
            'vin' => 'YV2RTZ50XMA234567', // VIN exemple pour Volvo
            'country' => 'FR',
        ]);

        $vehicle6 = Vehicle::create([
            'id' => "4d5e6f78-9012-3456-789a-bcdef1234567",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1, // Tracteur
            'vehicle_model_id' => VehicleModel::where('name', 'FM')->first()->id, // Volvo FM
            'registration' => 'GZ-192-AT',
            'vin' => 'YV2RTZ50XMA345678', // VIN exemple pour Volvo
            'country' => 'FR',
        ]);

        $vehicle7 = Vehicle::create([
            'id' => "5e6f7890-1234-5678-9abc-def123456789",
            'tenant_id' => $tenant->id,
            'vehicle_type_id' => 1, // Tracteur
            'vehicle_model_id' => VehicleModel::where('name', 'FM')->first()->id, // Volvo FM
            'registration' => 'GL-804-YQ',
            'vin' => 'YV2RTZ50XMA456789', // VIN exemple pour Volvo
            'country' => 'FR',
        ]);

        // Devices existants
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

        // Nouveaux devices pour les véhicules Leff Combustibles - Meurou
        $device3 = Device::create([
            'id' => "1a2b3c4d-5e6f-7890-1234-56789abcdef1",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1, // FMC650
            'imei' => '863719061276722',
            'sim_number' => '8944477100001276722',
            'serial_number' => 'FMC650_001',
            'vehicle_id' => $vehicle3->id,
        ]);

        $device4 = Device::create([
            'id' => "2b3c4d5e-6f78-9012-3456-789abcdef123",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1, // FMC650
            'imei' => '863719061260858',
            'sim_number' => '8944477100001260858',
            'serial_number' => 'FMC650_002',
            'vehicle_id' => $vehicle4->id,
        ]);

        $device5 = Device::create([
            'id' => "3c4d5e6f-7890-1234-5678-9abcdef12345",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1, // FMC650
            'imei' => '863719060961720',
            'sim_number' => '8944477100000961720',
            'serial_number' => 'FMC650_003',
            'vehicle_id' => $vehicle5->id,
        ]);

        $device6 = Device::create([
            'id' => "4d5e6f78-9012-3456-789a-bcdef1234567",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1, // FMC650
            'imei' => '864275075656804',
            'sim_number' => '8944477100075656804',
            'serial_number' => 'FMC650_004',
            'vehicle_id' => $vehicle6->id,
        ]);

        $device7 = Device::create([
            'id' => "5e6f7890-1234-5678-9abc-def123456789",
            'tenant_id' => $tenant->id,
            'device_type_id' => 1, // FMC650
            'imei' => '864275075520349',
            'sim_number' => '8944477100075520349',
            'serial_number' => 'FMC650_005',
            'vehicle_id' => $vehicle7->id,
        ]);
    }
}
