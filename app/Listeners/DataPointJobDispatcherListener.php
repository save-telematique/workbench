<?php

namespace App\Listeners;

use App\Contracts\DataPointHandlerJob;
use App\Events\DeviceMessageProcessed;
use Illuminate\Support\Facades\Log;
use App\Enum\MessageFields;
use App\Jobs\DataPointHandlers\ProcessGpsDataJob;
use App\Jobs\DataPointHandlers\UpdateVehicleOdometerJob;
use App\Jobs\DataPointHandlers\UpdateDeviceDataJob;

class DataPointJobDispatcherListener
{
    private static array $handlerMap = [
        MessageFields::GPS_DATA->value => [
            ProcessGpsDataJob::class,
        ],
        MessageFields::TOTAL_ODOMETER->value => [
            UpdateVehicleOdometerJob::class
        ],
        MessageFields::DEVICE_DATA->value => [
            UpdateDeviceDataJob::class
        ],
    ];

    public function __construct() {}

    public function handle(DeviceMessageProcessed $event): void
    {
        $typeIds = $event->deviceMessage->dataPoints->pluck('data_point_type_id')->unique()->toArray();
        foreach ($typeIds as $typeId) {
            if (isset(self::$handlerMap[$typeId])) {
                $jobClasses = self::$handlerMap[$typeId];

                foreach ($jobClasses as $jobClass) {
                    dispatch(new $jobClass($event->deviceMessage, $event->deviceMessage->device, $event->deviceMessage->device->vehicle));
                }
            }
        }
    }
}
