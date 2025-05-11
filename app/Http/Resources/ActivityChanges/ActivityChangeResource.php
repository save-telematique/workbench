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
            'recorded_at' => $this->recorded_at ? $this->recorded_at->toISOString() : null,
            'activity_id' => $this->activity_id,
            'type' => $this->type,
            
            // Related resources
            'working_day' => $this->whenLoaded('workingDay', fn() => new WorkingDayResource($this->workingDay)),
            'vehicle' => $this->whenLoaded('vehicle', fn() => new VehicleResource($this->vehicle)),
            'activity' => $this->whenLoaded('activity', fn() => new ActivityResource($this->activity)),
            
            // Timestamps
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
} 