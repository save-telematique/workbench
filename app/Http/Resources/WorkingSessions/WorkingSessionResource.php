<?php

namespace App\Http\Resources\WorkingSessions;

use App\Http\Resources\Activities\ActivityResource;
use App\Http\Resources\Drivers\DriverResource;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Http\Resources\WorkingDays\WorkingDayResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkingSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'working_day_id' => $this->working_day_id,
            'vehicle_id' => $this->vehicle_id,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'activity_id' => $this->activity_id,
            'type' => $this->type,
            'driving_time' => $this->driving_time,
            'break_needed_in' => $this->break_needed_in,
            'next_break_duration' => $this->next_break_duration,
            'remaining_driving_time' => $this->remaining_driving_time,
            'remaining_weekly_driving_time' => $this->remaining_weekly_driving_time,
            'weekly_driving_time' => $this->weekly_driving_time,
            'weekly_exceedeed_driving_limit' => $this->weekly_exceedeed_driving_limit,
            'duration' => $this->duration,
            
            'working_day' => $this->when($this->relationLoaded('workingDay'), function () {
                return new WorkingDayResource($this->workingDay);
            }),
            'vehicle' => $this->when($this->relationLoaded('vehicle'), function () {
                return new VehicleResource($this->vehicle);
            }),
            'activity' => $this->when($this->relationLoaded('activity'), function () {
                return new ActivityResource($this->activity);
            }),
            'driver' => $this->when($this->relationLoaded('driver'), function () {
                return new DriverResource($this->driver);
            }),
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 