<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowExecutionResource extends JsonResource
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
            'workflow_id' => $this->workflow_id,
            'triggered_by' => $this->triggered_by,
            'trigger_data' => $this->trigger_data,
            'status' => $this->status,
            'execution_log' => $this->execution_log,
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'error_message' => $this->error_message,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Computed attributes
            'duration' => $this->when(
                $this->started_at && $this->completed_at,
                fn () => $this->started_at->diffInMilliseconds($this->completed_at)
            ),
        ];
    }
} 