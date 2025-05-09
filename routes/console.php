<?php

use App\Models\DeviceDataPoint;
use App\Models\DeviceMessage;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

use function Laravel\Prompts\progress;

Artisan::command('device-messages:process', function () {
    if (DeviceMessage::whereNull('processed_at')->exists()) {
        $messages = progress(
            label: 'Processing messages',
            steps: DeviceMessage::whereNull('processed_at')->orderBy('created_at', 'asc')->get(),
            callback: function ($message, $progress) {
                $progress
                    ->label("Processing {$message->id}")
                    ->hint("Created on {$message->created_at}");

                return $message->process();
            },
            hint: 'This may take some time.'
        );
    }
})->everyTenMinutes();

Artisan::command('fresh-db', function () {
    DB::statement('DROP TABLE IF EXISTS device_data_points');
    Artisan::call('migrate:fresh');
    Artisan::call('db:seed');
});

