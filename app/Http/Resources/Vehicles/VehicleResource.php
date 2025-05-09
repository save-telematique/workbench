<?php

namespace App\Http\Resources\Vehicles;

use App\Http\Resources\Devices\DeviceResource;
use App\Http\Resources\Tenants\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
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
            'registration' => $this->registration,
            'vin' => $this->vin,
            'country' => $this->country,
            'tenant_id' => $this->tenant_id,
            'device_id' => $this->device_id,

            'vehicle_model' => new VehicleModelResource($this->whenLoaded('model')),
            'type' => $this->whenLoaded('type', fn() => $this->type ? new VehicleTypeResource($this->type) : null),
            'tenant' => $this->whenLoaded('tenant', fn() => $this->tenant ? new TenantResource($this->tenant) : null),
            'device' => $this->whenLoaded('device', fn() => $this->device ? new DeviceResource($this->device) : null),

            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->toISOString() : null,
        ];
    }
} 