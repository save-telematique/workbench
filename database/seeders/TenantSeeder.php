<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::create([
            'name' => 'Leff',
        ]);

        $tenant->domains()->create([
            'domain' => 'leff',
        ]);

        $tenant->users()->create([
            'name' => 'Leff',
            'email' => 'leff@save.test',
            'password' => bcrypt('password'),
        ]);

        $tenant = Tenant::create([
            'name' => 'Demo',
        ]);

        $tenant->domains()->create([
            'domain' => 'demo',
        ]);

        $tenant->users()->create([
            'name' => 'Demo',
            'email' => 'demo@save.test',
            'password' => bcrypt('password'),
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'admin@save.test',
            'tenant_id' => null,
            'password' => bcrypt('password'),
        ]);
    }
}
