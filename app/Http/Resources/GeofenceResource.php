<?php

namespace App\Http\Resources;

use App\Http\Resources\Groups\GroupResource;
use App\Http\Resources\Tenants\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GeofenceResource extends JsonResource
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
            'tenant_id' => $this->tenant_id,
            'group_id' => $this->group_id,
            'name' => $this->name,
            'geojson' => $this->geojson,
            'is_active' => $this->is_active,

            'tenant' => $this->whenLoaded('tenant', fn() => $this->tenant ? new TenantResource($this->tenant) : null),
            'group' => $this->whenLoaded('group', fn() => $this->group ? new GroupResource($this->group) : null),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
