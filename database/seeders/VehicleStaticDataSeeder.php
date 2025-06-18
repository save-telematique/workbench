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
        VehicleType::create([
            'name' => 'Tracteur',
        ]);

        VehicleType::create([
            'name' => 'Remorque',
        ]);

        VehicleType::create([
            'name' => 'Véhicule léger',
        ]);

        $volvo = VehicleBrand::create([
            'name' => 'Volvo',
        ]);

        $renault = VehicleBrand::create([
            'name' => 'Renault',
        ]);

        $daf = VehicleBrand::create([
            'name' => 'DAF',
        ]);

        $volvo->models()->create([
            'name' => 'FE',
        ]);

        $volvo->models()->create([
            'name' => 'FM',
        ]);

        $renault->models()->create([
            'name' => 'T',
        ]);

        $daf->models()->create([
            'name' => 'XF',
        ]);
    }
}
