<?php

namespace App\Http\Resources\Groups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
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
            'description' => $this->description,
            'color' => $this->color,
            'parent_id' => $this->parent_id,
            'tenant_id' => $this->tenant_id,
            'is_active' => $this->is_active,
            'full_path' => $this->full_path,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'parent' => $this->whenLoaded('parent', function () {
                return new GroupResource($this->parent);
            }),
            
            'children' => $this->whenLoaded('children', function () {
                return GroupResource::collection($this->children);
            }),
            
            'tenant' => $this->whenLoaded('tenant', function () {
                return [
                    'id' => $this->tenant->id,
                    'name' => $this->tenant->name,
                ];
            }),
            
            // Counts
            'children_count' => $this->whenCounted('children'),
            'vehicles_count' => $this->whenCounted('vehicles'),
            'drivers_count' => $this->whenCounted('drivers'),
            'users_count' => $this->whenCounted('users'),
            
            // Additional computed properties
            'has_children' => $this->children()->exists(),
            'can_delete' => !$this->children()->exists() && 
                           !$this->vehicles()->exists() && 
                           !$this->drivers()->exists(),
        ];
    }
} 