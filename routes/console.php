<?php

use App\Actions\Alerts\CreateAlertAction;
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

Artisan::command('alerts:assign', function () {
    CreateAlertAction::run([
        'title' => 'Test Alert',
        'content' => 'This is a test alert',
        'severity' => 'info',
        'alertable_type' => 'App\Models\Vehicle',
        'alertable_id' => '7f62d3b3-137c-41ca-9af3-cb18400e599c',
        'tenant_id' => '677246e9-e488-47d9-9e55-de6939b6bd84',
    ]);
});

