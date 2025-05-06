<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Create new vehicle location partitions on the first day of each month
        $schedule->command('vehicle-locations:create-partition 3')
                ->monthlyOn(1, '01:00')
                ->appendOutputTo(storage_path('logs/vehicle-location-partitions.log'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
} 