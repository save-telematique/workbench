<?php

namespace App\Http\Resources\Alerts;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlertResource extends JsonResource
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
            'title' => $this->title,
            'content' => $this->content,
            'severity' => $this->severity,
            'severity_label' => $this->severity_label,
            'severity_color' => $this->severity_color,
            'metadata' => $this->metadata,
            'alertable_type' => $this->alertable_type,
            'alertable_id' => $this->alertable_id,
            'tenant_id' => $this->tenant_id,
            'created_by' => $this->created_by,
            'expires_at' => $this->expires_at?->toISOString(),
            'is_active' => $this->is_active,
            'is_expired' => $this->is_expired,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        // Include read status for current user if available
        if ($request->user()) {
            $data['is_read'] = $this->isReadBy($request->user());
            $data['read_at'] = $this->users()
                ->where('user_id', $request->user()->id)
                ->first()?->pivot?->read_at?->toISOString();
        }

        // Include related entities if loaded
        if ($this->relationLoaded('alertable')) {
            $data['alertable'] = $this->alertable;
        }

        if ($this->relationLoaded('creator')) {
            $data['creator'] = [
                'id' => $this->creator?->id,
                'name' => $this->creator?->name,
            ];
        }

        if ($this->relationLoaded('tenant')) {
            $data['tenant'] = [
                'id' => $this->tenant?->id,
                'name' => $this->tenant?->name,
            ];
        }

        return $data;
    }
} 