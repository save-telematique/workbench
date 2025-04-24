<?php

namespace Database\Seeders;

use App\Models\BoxType;
use App\Models\DeviceType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceStaticDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DeviceType::updateOrCreate(['id' => 1], [
            'name' => 'FMC650',
            'manufacturer' => "Teltonika",
        ]);

        DeviceType::updateOrCreate(['id' => 2], [
            'name' => 'FMC130',
            'manufacturer' => "Teltonika",
        ]);
    }
}
