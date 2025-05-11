<?php

namespace App\Http\Resources\Drivers;

use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Users\UserResource;
use App\Http\Resources\WorkingDays\WorkingDayResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverResource extends JsonResource
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
            'surname' => $this->surname,
            'firstname' => $this->firstname,
            'phone' => $this->phone,
            'license_number' => $this->license_number,
            'card_issuing_country' => $this->card_issuing_country,
            'card_number' => $this->card_number,
            'birthdate' => $this->birthdate->format('Y-m-d'),
            'card_issuing_date' => $this->card_issuing_date->format('Y-m-d'),
            'card_expiration_date' => $this->card_expiration_date->format('Y-m-d'),
            'tenant_id' => $this->tenant_id,
            'user_id' => $this->user_id,
            'tenant' => $this->whenLoaded('tenant', fn() => new TenantResource($this->tenant)),
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'working_days' => $this->whenLoaded('workingDays', fn() => WorkingDayResource::collection($this->workingDays)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
} 