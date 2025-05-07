<?php

use App\Models\DeviceMessage;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use function Laravel\Prompts\progress;

Artisan::command('messages:process', function () {
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