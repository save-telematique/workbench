<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ProductionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            ActivitiesSeeder::class,
            VehicleStaticDataSeeder::class,
            DeviceStaticDataSeeder::class,
            DataPointTypeSeeder::class,
        ]);

        $superAdmin = User::factory()->create([
            'name' => 'Jonathan Jean',
            'email' => 'contact@jonathanjean.fr',
            'tenant_id' => null,
            'password' => bcrypt('password'),
        ]);
        
        // Assign super_admin role to the admin user
        $superAdmin->assignRole('super_admin');

        $this->call(LeffTenantSeeder::class);
        $this->call(MauffreyTenantSeeder::class);
    }
}