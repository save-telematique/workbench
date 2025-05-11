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
            'color' => $this->color,
            'parent' => $this->when($this->relationLoaded('parent'), function () {
                return new ActivityResource($this->parent);
            }),
            'childrens' => $this->when($this->relationLoaded('childrens'), function () {
                return ActivityResource::collection($this->childrens);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 