<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // First run the permission seeder to create roles and permissions
        $this->call(PermissionSeeder::class);
        
        // Create super admin user
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@save.test',
            'tenant_id' => null,
            'password' => bcrypt('password'),
        ]);
        
        // Assign super_admin role to the admin user
        $superAdmin->assignRole('super_admin');
        
        // Create central admin user
        $centralAdmin = User::factory()->create([
            'name' => 'Central Admin',
            'email' => 'central-admin@save.test',
            'tenant_id' => null,
            'password' => bcrypt('password'),
        ]);
        
        // Assign central_admin role
        $centralAdmin->assignRole('central_admin');
        
        // Create central user
        $centralUser = User::factory()->create([
            'name' => 'Central User',
            'email' => 'central-user@save.test',
            'tenant_id' => null,
            'password' => bcrypt('password'),
        ]);
        
        // Assign central_user role
        $centralUser->assignRole('central_user');
        
        $this->call([
            VehicleStaticDataSeeder::class,
            DeviceStaticDataSeeder::class,
        ]);

        $this->call(LeffTenantSeeder::class);
        $this->call(DemoTenantSeeder::class);
        //$this->call(MauffreyTenantSeeder::class);
    }
}
