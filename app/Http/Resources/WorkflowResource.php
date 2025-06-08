<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            
            // Related data when loaded
            'triggers' => WorkflowTriggerResource::collection($this->whenLoaded('triggers')),
            'conditions' => WorkflowConditionResource::collection($this->whenLoaded('conditions')),
            'actions' => WorkflowActionResource::collection($this->whenLoaded('actions')),
            'executions' => WorkflowExecutionResource::collection($this->whenLoaded('executions')),
            
            // Computed attributes
            'triggers_count' => $this->whenCounted('triggers'),
            'conditions_count' => $this->whenCounted('conditions'),
            'actions_count' => $this->whenCounted('actions'),
            'executions_count' => $this->whenCounted('executions'),
            
            // Recent execution stats
            'last_execution_at' => $this->when(
                $this->relationLoaded('executions') && $this->executions->isNotEmpty(),
                fn () => $this->executions->first()?->created_at?->toISOString()
            ),
            'last_execution_status' => $this->when(
                $this->relationLoaded('executions') && $this->executions->isNotEmpty(),
                fn () => $this->executions->first()?->status
            ),
        ];
    }
} 