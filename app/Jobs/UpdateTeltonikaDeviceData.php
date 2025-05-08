<?php

namespace App\Jobs;

use App\Models\Device;
use App\Services\TeltonikaApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateTeltonikaDeviceData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The device instance.
     */
    protected Device $device;

    /**
     * Create a new job instance.
     */
    public function __construct(Device $device)
    {
        $this->device = $device;
    }

    /**
     * Execute the job.
     */
    public function handle(TeltonikaApiService $teltonikaApi): void
    {
        if (empty($this->device->imei)) {
            return;
        }

        $deviceData = $teltonikaApi->getDeviceInfo($this->device->imei);

        if (!$deviceData) {
            return;
        }

        $this->updateDeviceInfo($deviceData);
    }

    /**
     * Update the device information from the API data.
     */
    protected function updateDeviceInfo(array $deviceData): void
    {
        $updates = [];

        if (isset($deviceData['firmware_version'])) {
            $updates['firmware_version'] = $deviceData['firmware_version'];
        }

        if (isset($deviceData['serial_number']) && empty($this->device->serial_number)) {
            $updates['serial_number'] = $deviceData['serial_number'];
        }

        if (!empty($updates)) {
            $this->device->update($updates);
        }
    }
} 