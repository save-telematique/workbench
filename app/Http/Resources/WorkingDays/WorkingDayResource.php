<?php

namespace App\Http\Resources\WorkingDays;

use App\Http\Resources\Drivers\DriverResource;
use App\Http\Resources\WorkingSessions\WorkingSessionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkingDayResource extends JsonResource
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
            'driver_id' => $this->driver_id,
            'date' => $this->date,
            'driving_time' => $this->driving_time,
            'break_needed_in' => $this->break_needed_in,
            'next_break_time' => $this->next_break_time,
            'remaining_driving_time' => $this->remaining_driving_time,
            
            'driver' => $this->when($this->relationLoaded('driver'), function () {
                return new DriverResource($this->driver);
            }),
            'working_sessions' => $this->when($this->relationLoaded('workingSessions'), function () {
                return WorkingSessionResource::collection($this->workingSessions);
            }),
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 