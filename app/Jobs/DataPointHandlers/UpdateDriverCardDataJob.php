<?php

namespace App\Jobs\DataPointHandlers;

use App\Contracts\DataPointHandlerJob;
use App\Enum\MessageFields;
use App\Models\DeviceDataPoint;
use App\Helpers\GeoHelper;
use App\Models\VehicleLocation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Device;
use App\Models\Vehicle;
use App\Enum\DeviceDataPointType;
use App\Jobs\ComputeWorkingSessions;
use App\Models\Activity;
use App\Models\ActivityChange;
use App\Models\DeviceMessage;
use App\Models\Driver;
use App\Models\WorkingDay;

class UpdateDriverCardDataJob implements ShouldQueue, DataPointHandlerJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DeviceMessage $deviceMessage;
    protected Device $device;
    protected Vehicle $vehicle;

    /**
     * Create a new job instance.
     *
     * @param DeviceMessage $deviceMessage
     * @param Device $device
     * @param Vehicle|null $vehicle
     */
    public function __construct(DeviceMessage $deviceMessage, Device $device, ?Vehicle $vehicle)
    {
        $this->deviceMessage = $deviceMessage;
        $this->device = $device;
        $this->vehicle = $vehicle;
    }


    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (!$this->vehicle) {
            return;
        }

        $fields = $this->deviceMessage->dataPoints;

        $hasCard = $fields->where('data_point_type_id', MessageFields::DRIVER_1_CARD_PRESENCE->value)->first();

        $recorded_at = $hasCard->recorded_at;
        if ($hasCard) {
            $hasCard = $hasCard->value;

            if (!$hasCard) {
                if ($this->vehicle->currentDriver) {
                    $workingDay = $this->vehicle->currentDriver->workingDays()->whereDate('date', $recorded_at)->first();

                    if (!$workingDay) {
                        $workingDay = WorkingDay::create([
                            'driver_id' => $this->vehicle->currentDriver->id,
                            'date' => $recorded_at,
                        ]);
                    }

                    ActivityChange::create([
                        'vehicle_id' => $this->vehicle->id,
                        'working_day_id' => $workingDay->id,
                        'recorded_at' => $recorded_at,
                        'activity_id' => Activity::REMOVED_CARD,
                    ]);

                    ComputeWorkingSessions::dispatch($this->vehicle, $workingDay);
                }

                $this->vehicle->current_driver_id = null;
                $this->vehicle->current_working_session_id = null;
            } else {
                $driver = null;

                $driverId = $fields->where('data_point_type_id', MessageFields::DRIVER_ID_1->value)->first();
                if ($driverId) {
                    $driver = Driver::where('card_number', $driverId->value)->first();

                    if (!$driver) {
                        // TODO raise exception
                        $driver = Driver::create([
                            'card_number' => $driverId->value,
                            'firstname' => 'Unknown',
                            'surname' => 'Unknown',
                            'tenant_id' => $this->vehicle->tenant_id,
                        ]);
                    }

                    $this->vehicle->current_driver_id = $driver->id;

                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $this->vehicle->save();
                }

                $workingState = $fields->where('data_point_type_id', MessageFields::DRIVER_1_WORKING_STATE->value)->first();
                if ($workingState) {
                    $workingState = $workingState->value;

                    $lastActivity = $this->vehicle->activityChanges()->orderBy('recorded_at', 'desc')->first();

                    if (!$lastActivity || $lastActivity->activity_id !== $workingState) {
                        if (!$driver) {
                            $driver = $this->vehicle->currentDriver;
                        }

                        if ($driver) {
                            $workingDay = WorkingDay::firstOrCreate([
                                'driver_id' => $driver->id,
                                'date' => $recorded_at,
                            ]);

                            ActivityChange::create([
                                'working_day_id' => $workingDay->id,
                                'vehicle_id' => $this->vehicle->id,
                                'recorded_at' => $recorded_at,
                                'activity_id' => $workingState,
                            ]);

                            ComputeWorkingSessions::dispatch($this->vehicle, $workingDay);
                        }
                    }
                }

                $currentDrivingTime = $fields->where('data_point_type_id', MessageFields::DRIVER_1_CURRENT_DAILY_DRIVING_TIME->value)->first();
                if ($currentDrivingTime) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->driving_time = $currentDrivingTime->value;
                    $workingDay->save();
                }

                $remainingDrivingTime = $fields->where('data_point_type_id', MessageFields::DRIVER_1_REMAINING_CURRENT_DRIVING_TIME->value)->first();
                if ($remainingDrivingTime) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->remaining_driving_time = $remainingDrivingTime->value;
                    $workingDay->save();
                }

                $nextBreakDuration = $fields->where('data_point_type_id', MessageFields::DRIVER_1_DURATION_OF_NEXT_BREAK_REST->value)->first();
                if ($nextBreakDuration) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->next_break_duration = $nextBreakDuration->value;
                    $workingDay->save();
                }


                $remainingTimeUntilNextBreakOrRest = $fields->where('data_point_type_id', MessageFields::DRIVER_1_REMAINING_TIME_UNTIL_NEXT_BREAK_OR_REST->value)->first();
                if ($remainingTimeUntilNextBreakOrRest) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->break_needed_in = $remainingTimeUntilNextBreakOrRest->value;
                    $workingDay->save();
                }


                $remainingDrivingTimeOfCurrentWeek = $fields->where('data_point_type_id', MessageFields::DRIVER_1_REMAINING_DRIVING_TIME_OF_CURRENT_WEEK->value)->first();
                if ($remainingDrivingTimeOfCurrentWeek) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->remaining_weekly_driving_time = $remainingDrivingTimeOfCurrentWeek->value;
                    $workingDay->save();
                }

                $currentWeeklyDrivingTime = $fields->where('data_point_type_id', MessageFields::DRIVER_1_CURRENT_WEEKLY_DRIVING_TIME->value)->first();
                if ($currentWeeklyDrivingTime) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->weekly_driving_time = $currentWeeklyDrivingTime->value;
                    $workingDay->save();
                }


                $numberOfTimes9hDailyDrivingTimeExceeds = $fields->where('data_point_type_id', MessageFields::DRIVER_1_NUMBER_OF_TIMES_9H_DAILY_DRIVING_TIME_EXCEEDS->value)->first();
                if ($numberOfTimes9hDailyDrivingTimeExceeds) {
                    $workingDay = WorkingDay::firstOrCreate([
                        'driver_id' => $driver->id,
                        'date' => $recorded_at,
                    ]);

                    $workingDay->weekly_exceedeed_driving_limit = $numberOfTimes9hDailyDrivingTimeExceeds->value;
                    $workingDay->save();
                }
            }
        }

        $this->vehicle->save();
    }
} 