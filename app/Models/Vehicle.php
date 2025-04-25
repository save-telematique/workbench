<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Builder;

class Vehicle extends Model
{
    use HasFactory, BelongsToTenant, HasUuids, SoftDeletes, Searchable;

    protected $fillable = [
        'tenant_id',
        'vehicle_model_id',
        'vehicle_type_id',
        'registration',
        'vin',
        'year',
        'color',
        'notes',
    ];

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return array_merge($this->toArray(), [
            'id' => (string) $this->id,
            'tenant_id' => (string) $this->tenant_id,
            'registration' => (string) $this->registration,
            'vin' => (string) $this->vin,
            'model_name' => (string) ($this->model?->name ?? ''),
            'brand_name' => (string) ($this->model?->vehicleBrand?->name ?? ''),
            'type_name' => (string) ($this->type?->name ?? ''),
            'tenant_name' => (string) ($this->tenant?->name ?? ''),
            'created_at' => $this->created_at?->timestamp,
            '__soft_deleted' => (bool) $this->trashed(),
        ]);
    }

    /**
     * Modify the query used to retrieve models when making all models searchable.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with(['model', 'model.vehicleBrand', 'type', 'tenant']);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function device()
    {
        return $this->hasOne(Device::class);
    }

    public function model()
    {
        return $this->belongsTo(VehicleModel::class, 'vehicle_model_id');
    }

    public function type()
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
