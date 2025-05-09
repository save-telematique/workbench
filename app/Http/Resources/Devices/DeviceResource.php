<?php

namespace App\Http\Resources\Devices;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceResource extends JsonResource
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
            'serial_number' => $this->serial_number,
            // Add other device-specific fields like 'imei', 'phone_number', etc.
            'model_name' => $this->model_name, // Example field, adjust as per your Device model
            'status' => $this->status, // Example field
            'last_seen_at' => $this->last_seen_at ? $this->last_seen_at->toISOString() : null,

            'type' => new DeviceTypeResource($this->whenLoaded('type')),

            // Timestamps if needed
            // 'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            // 'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
} 