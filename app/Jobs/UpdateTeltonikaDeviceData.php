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
        // Log the start of the job
        Log::info(__('devices.jobs.teltonika_update.start'), [
            'device_id' => $this->device->id,
            'imei' => $this->device->imei,
        ]);

        // Skip if the device doesn't have an IMEI
        if (empty($this->device->imei)) {
            Log::warning(__('devices.jobs.teltonika_update.no_imei'), [
                'device_id' => $this->device->id,
            ]);
            return;
        }

        // Get device data from Teltonika API
        $deviceData = $teltonikaApi->getDeviceInfo($this->device->imei);

        // If no data was retrieved, log and exit
        if (!$deviceData) {
            Log::warning(__('devices.jobs.teltonika_update.no_data'), [
                'device_id' => $this->device->id,
                'imei' => $this->device->imei,
            ]);
            return;
        }

        // Update device information
        $this->updateDeviceInfo($deviceData);

        // Log successful update
        Log::info(__('devices.jobs.teltonika_update.success'), [
            'device_id' => $this->device->id,
            'imei' => $this->device->imei,
        ]);
    }

    /**
     * Update the device information from the API data.
     */
    protected function updateDeviceInfo(array $deviceData): void
    {
        $updates = [];

        // Map API fields to device model fields
        if (isset($deviceData['firmware_version'])) {
            $updates['firmware_version'] = $deviceData['firmware_version'];
        }

        // Add any additional fields that need to be updated
        // For example, if the API provides serial number
        if (isset($deviceData['serial_number']) && empty($this->device->serial_number)) {
            $updates['serial_number'] = $deviceData['serial_number'];
        }

        // If we have updates to apply
        if (!empty($updates)) {
            $this->device->update($updates);
        }
    }
} 