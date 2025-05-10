<?php

namespace App\Http\Resources\Devices;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataPointResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'value' => $this->value,
            'recorded_at' => $this->recorded_at,
        ];
    }
} 