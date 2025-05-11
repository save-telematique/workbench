<?php

namespace App\Http\Resources\ActivityChanges;

use App\Http\Resources\Activities\ActivityResource;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Http\Resources\WorkingDays\WorkingDayResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityChangeResource extends JsonResource
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
            'recorded_at' => $this->recorded_at,
            'activity_id' => $this->activity_id,
            'type' => $this->type,
            
            'working_day' => $this->when($this->relationLoaded('workingDay'), function () {
                return new WorkingDayResource($this->workingDay);
            }),
            'vehicle' => $this->when($this->relationLoaded('vehicle'), function () {
                return new VehicleResource($this->vehicle);
            }),
            'activity' => $this->when($this->relationLoaded('activity'), function () {
                return new ActivityResource($this->activity);
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 