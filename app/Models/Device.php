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

    protected $fillable = [
        'tenant_id',
        'device_type_id',
        'vehicle_id',
        'firmware_version',
        'serial_number',
        'sim_number',
        'imei',
    ];

    protected $casts = [
        'last_contact_at' => 'datetime',
    ];

    public function toSearchableArray()
    {
        return array_merge($this->toArray(),[
            'id' => (string) $this->id,
            'tenant_id' => (string) $this->tenant_id,
            'imei' => (string) $this->imei,
            'sim_number' => (string) $this->sim_number,
            'serial_number' => (string) $this->serial_number,
            'type_name' => (string) ($this->type?->name ?? ''),
            'type_manufacturer' => (string) ($this->type?->manufacturer ?? ''),
            'tenant_name' => (string) ($this->tenant?->name ?? ''),
            'vehicle_registration' => (string) ($this->vehicle?->registration ?? ''),
            'vehicle_model' => (string) ($this->vehicle?->model?->name ?? ''),
            'vehicle_brand' => (string) ($this->vehicle?->model?->vehicleBrand?->name ?? ''),
            'created_at' => $this->created_at->timestamp,
            '__soft_deleted' => (bool) $this->trashed(),
        ]);
    }

    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with([
            'type', 
            'vehicle', 
            'vehicle.type', 
            'vehicle.model', 
            'vehicle.model.vehicleBrand', 
            'tenant'
        ]);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function type()
    {
        return $this->belongsTo(DeviceType::class, 'device_type_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
