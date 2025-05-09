<?php

namespace App\Http\Resources\Users;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'locale' => $this->locale,
            'tenant_id' => $this->tenant_id,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Only include roles and permissions if they are loaded
        if ($this->relationLoaded('roles')) {
            $data['roles'] = $this->roles->pluck('name');
        }

        if ($this->relationLoaded('permissions')) {
            $data['permissions'] = $this->getAllPermissions()->pluck('name');
        }

        return $data;
    }
} 