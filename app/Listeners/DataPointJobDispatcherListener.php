<?php

namespace App\Listeners;

use App\Contracts\DataPointHandlerJob;
use App\Events\NewDeviceDataPoint;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use ReflectionException;

class DataPointJobDispatcherListener // No ShouldQueue here, this listener itself is quick.
{
    // We can make this an array of discovered job FQCNs to avoid reflection on every event.
    // This would be populated once, perhaps in the constructor or a service provider.
    // For simplicity now, it will discover on each handle call, but this is an optimization point.
    private array $handlerJobClasses = [];

    public function __construct()
    {
        $this->discoverHandlerJobs();
    }

    private function discoverHandlerJobs(): void
    {
        $path = app_path('Jobs/DataPointHandlers');
        $files = File::glob($path . '/*.php');

        foreach ($files as $file) {
            $className = 'App\\Jobs\\DataPointHandlers\\' . File::name($file);
            try {
                if (!class_exists($className)) continue;
                
                $reflection = new ReflectionClass($className);
                if ($reflection->isInstantiable() && $reflection->implementsInterface(DataPointHandlerJob::class)) {
                    $this->handlerJobClasses[] = $className;
                }
            } catch (ReflectionException $e) {
                Log::error("Error reflecting class {$className}: " . $e->getMessage());
            }
        }
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\NewDeviceDataPoint  $event
     * @return void
     */
    public function handle(NewDeviceDataPoint $event): void
    {
        $firedJobCountOverall = 0;

        foreach ($event->deviceDataPoints as $deviceDataPoint) {
            $firedJobCountForDataPoint = 0;
            foreach ($this->handlerJobClasses as $jobClass) {
                /** @var DataPointHandlerJob $jobClass */
                $reactsToTypes = $jobClass::getReactsToDataPointTypes();

                if (in_array($deviceDataPoint->data_point_type_id, $reactsToTypes, true)) {
                    try {
                        Log::debug("Dispatching job {$jobClass} for data point type ID: {$deviceDataPoint->data_point_type_id}");
                        $jobInstance = new $jobClass($deviceDataPoint);
                        
                        if ($jobInstance instanceof \Illuminate\Contracts\Queue\ShouldQueue) {
                             dispatch($jobInstance);
                             $firedJobCountForDataPoint++;
                             $firedJobCountOverall++;
                        } else {
                            app()->call([$jobInstance, 'handle']); 
                            $firedJobCountForDataPoint++;
                            $firedJobCountOverall++;
                        }

                    } catch (\Exception $e) {
                        Log::error("Error dispatching or handling job {$jobClass}", [
                            'exception' => $e,
                            'device_data_point_id' => $deviceDataPoint->id
                        ]);
                    }
                }
            }
        }
    }
} 