<?php

namespace App\Http\Resources\Tenants;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $base = [
            'id' => $this->id,
            'name' => $this->name,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if (!tenant('id')) {
            array_merge($base, [
                'phone' => $this->phone,
                'email' => $this->email,
                'address' => $this->address,
                'svg_logo' => $this->svg_logo,
            ]);
        }

        return $base;
    }
} 