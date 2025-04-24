<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@save.test',
            'tenant_id' => null,
            'password' => bcrypt('password'),
        ]);
        
        $this->call([
            VehicleStaticDataSeeder::class,
            DeviceStaticDataSeeder::class,
        ]);

        $this->call(LeffTenantSeeder::class);
        $this->call(DemoTenantSeeder::class);

    }
}
