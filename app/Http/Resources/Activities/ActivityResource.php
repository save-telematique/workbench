<?php

namespace App\Http\Resources\Activities;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
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
            'name' => $this->name,
            'parent_id' => $this->parent_id,
            
            // Related resources
            'parent' => $this->whenLoaded('parent', fn() => new ActivityResource($this->parent)),
            'childrens' => $this->whenLoaded('childrens', fn() => ActivityResource::collection($this->childrens)),
            
            // Timestamps
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
} 