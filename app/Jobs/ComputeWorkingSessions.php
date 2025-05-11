<?php

namespace App\Jobs;

use App\Models\Activity;
use App\Models\Vehicle;
use App\Models\WorkingDay;
use App\Models\WorkingSession;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ComputeWorkingSessions implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Vehicle $vehicle, public WorkingDay $workingDay)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $activityChanges = $this->vehicle->activityChanges()->where('working_day_id', $this->workingDay->id)->orderBy('recorded_at', 'asc')->get();

        $currentWorkingSession = null;

        $this->vehicle->current_working_session_id = null;
        $this->vehicle->save();

        WorkingSession::where('vehicle_id', $this->vehicle->id)->where('working_day_id', $this->workingDay->id)->delete();

        foreach ($activityChanges as $activityChange) {
            if ($currentWorkingSession && $activityChange->activity_id === Activity::REMOVED_CARD) {
                $currentWorkingSession->ended_at = $activityChange->recorded_at;
                $currentWorkingSession->save();

                $currentWorkingSession = null;
                continue;
            }

            if ($currentWorkingSession && $currentWorkingSession->activity_id !== $activityChange->activity_id) {
                $currentWorkingSession->ended_at = $activityChange->recorded_at;
                $currentWorkingSession->save();

                $currentWorkingSession = null;
            }

            if ($currentWorkingSession === null && $activityChange->activity_id !== Activity::REMOVED_CARD) {
                $currentWorkingSession = WorkingSession::create([
                    'vehicle_id' => $this->vehicle->id,
                    'working_day_id' => $activityChange->working_day_id,
                    'started_at' => $activityChange->recorded_at,
                    'activity_id' => $activityChange->activity_id,
                ]);

                $this->vehicle->current_working_session_id = $currentWorkingSession->id;
                $this->vehicle->save();
            }
        }
    }
}
