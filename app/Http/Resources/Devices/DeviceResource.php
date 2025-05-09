<?php

namespace App\Http\Resources\Devices;

use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Vehicles\VehicleResource;
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
            'imei' => $this->imei,
            'sim_number' => $this->sim_number,
            'firmware_version' => $this->firmware_version,
            'vehicle_id' => $this->vehicle_id,
            'tenant_id' => $this->tenant_id,
            'last_contact_at' => $this->last_contact_at ? $this->last_contact_at->toISOString() : null,

            'type' => new DeviceTypeResource($this->whenLoaded('type')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),

            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
} 