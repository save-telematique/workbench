<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class Device extends Model
{
    use HasFactory, HasUuids, BelongsToTenant, Searchable, SoftDeletes;

    protected $casts = [
        'last_contact_at' => 'datetime',
    ];

    public function toSearchableArray()
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'imei' => (string) $this->imei,
        'sim_number' => (string) $this->sim_number,
        'serial_number' => (string) $this->serial_number,
        'type_name' => $this->type->name,
        'type_manufacturer' => $this->type->manufacturer,
        'tenant_name' => $this->tenant?->name ?? '',
        'vehicle_registration' => $this->vehicle?->registration ?? '',
        'vehicle_model' => $this->vehicle?->model->name ?? '',
        'vehicle_brand' => $this->vehicle?->model->brand->name ?? '',
        'created_at' => $this->created_at->timestamp,
    ]);
}

    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with('type', 'vehicle', 'vehicle.type', 'vehicle.model', 'vehicle.model.brand', 'tenant');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function type()
    {
        return $this->belongsTo(DeviceType::class, 'device_type_id');
    }
}
