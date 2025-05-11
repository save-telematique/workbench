<?php

namespace App\Http\Resources\Vehicles;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleLocationResource extends JsonResource
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
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'speed' => $this->speed,
            'heading' => $this->heading,
            'ignition' => $this->ignition,
            'moving' => $this->moving,
            'altitude' => $this->altitude,
            'address' => $this->address,
            'address_details' => $this->address_details,
            'recorded_at' => $this->recorded_at ? $this->recorded_at->toISOString() : null,
        ];
    }
} 