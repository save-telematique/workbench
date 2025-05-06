<?php

namespace App\Console\Commands;

use App\Services\VehicleLocationService;
use Illuminate\Console\Command;

class CreateVehicleLocationPartition extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vehicle-locations:create-partition {months=1 : Number of months ahead to create partition for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new partition for the vehicle_locations table';

    /**
     * Execute the console command.
     */
    public function handle(VehicleLocationService $locationService): int
    {
        $months = $this->argument('months');
        
        try {
            $locationService->createPartition((int) $months);
            $this->info("Successfully created partition for vehicle locations {$months} month(s) ahead.");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to create partition: {$e->getMessage()}");
            return 1;
        }
    }
} 