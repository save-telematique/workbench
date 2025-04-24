<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use App\Models\VehicleType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VehicleStaticDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        VehicleType::updateOrCreate(['id' => 1], [
            'name' => 'Tracteur',
        ]);

        VehicleType::updateOrCreate(['id' => 2], [
            'name' => 'Remorque',
        ]);

        VehicleType::updateOrCreate(['id' => 3], [
            'name' => 'Car',
        ]);

        $volvo = VehicleBrand::updateOrCreate(['id' => 1], [
            'name' => 'Volvo',
        ]);

        $renault = VehicleBrand::updateOrCreate(['id' => 2], [
            'name' => 'Renault',
        ]);

        $volvo->models()->create([
            'name' => 'FE',
        ]);

        $renault->models()->create([
            'name' => 'T',
        ]);
    }
}
