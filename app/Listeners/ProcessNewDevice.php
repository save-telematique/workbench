<?php

namespace App\Listeners;

use App\Events\DeviceCreated;
use App\Jobs\UpdateTeltonikaDeviceData;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessNewDevice implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(DeviceCreated $event): void
    {
        $device = $event->device;
        
        switch (strtolower($device->type->manufacturer)) {
            case 'teltonika':
                //UpdateTeltonikaDeviceData::dispatch($device);
                break;
            default:
                break;
        }
    }
} 