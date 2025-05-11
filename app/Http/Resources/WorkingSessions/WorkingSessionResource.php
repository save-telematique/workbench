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
            'started_at' => $this->started_at ? $this->started_at->toISOString() : null,
            'ended_at' => $this->ended_at ? $this->ended_at->toISOString() : null,
            'activity_id' => $this->activity_id,
            'type' => $this->type,
            'driving_time' => $this->driving_time,
            'break_needed_in' => $this->break_needed_in,
            'next_break_duration' => $this->next_break_duration,
            'remaining_driving_time' => $this->remaining_driving_time,
            'remaining_weekly_driving_time' => $this->remaining_weekly_driving_time,
            'weekly_driving_time' => $this->weekly_driving_time,
            'weekly_exceedeed_driving_limit' => $this->weekly_exceedeed_driving_limit,
            'duration' => $this->when(isset($this->duration), fn() => $this->duration),
            
            // Related resources
            'working_day' => $this->whenLoaded('workingDay', fn() => new WorkingDayResource($this->workingDay)),
            'vehicle' => $this->whenLoaded('vehicle', fn() => new VehicleResource($this->vehicle)),
            'activity' => $this->whenLoaded('activity', fn() => new ActivityResource($this->activity)),
            'driver' => $this->whenLoaded('driver', fn() => new DriverResource($this->driver)),
            
            // Timestamps
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
} 