<?php

namespace App\Http\Resources\Vehicles;

use App\Http\Resources\ActivityChanges\ActivityChangeResource;
use App\Http\Resources\Devices\DeviceResource;
use App\Http\Resources\Drivers\DriverResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\WorkingSessions\WorkingSessionResource;
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
            'current_driver' => $this->whenLoaded('currentDriver', fn() => $this->currentDriver ? new DriverResource($this->currentDriver) : null),
            'current_working_session' => $this->whenLoaded('currentWorkingSession', fn() => $this->currentWorkingSession ? new WorkingSessionResource($this->currentWorkingSession) : null),
            'current_location' => $this->whenLoaded('currentLocation', fn() => $this->currentLocation ? new VehicleLocationResource($this->currentLocation) : null),
            'working_sessions' => $this->whenLoaded('workingSessions', fn() => WorkingSessionResource::collection($this->workingSessions)),
            'activity_changes' => $this->whenLoaded('activityChanges', fn() => ActivityChangeResource::collection($this->activityChanges)),

            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->toISOString() : null,
        ];
    }
} 