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
        'odometer',
        'current_vehicle_location_id',
        'current_driver_id',
        'current_working_session_id',
        'country',
        'tenant_id'
    ];

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        $array = [
            'id' => (string) $this->id,
            'tenant_id' => (string) $this->tenant_id,
            'registration' => (string) $this->registration,
            'vin' => (string) $this->vin,
            'model_name' => (string) $this->model?->name,
            'brand_name' => (string) $this->model?->vehicleBrand?->name,
            'type_name' => (string) $this->type?->name,
            'tenant_name' => (string) $this->tenant?->name,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
            '__soft_deleted' => (bool) $this->trashed(),
        ];

        return $array;
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

    public function locations()
    {
        return $this->hasMany(VehicleLocation::class, 'vehicle_id')->orderBy('recorded_at', 'desc');
    }

    public function currentLocation()
    {
        return $this->belongsTo(VehicleLocation::class, 'current_vehicle_location_id');
    }


    public function workingSessions()
    {
        return $this->hasMany(WorkingSession::class)->orderBy('started_at', 'asc');
    }

    public function currentWorkingSession()
    {
        return $this->belongsTo(WorkingSession::class, 'current_working_session_id');
    }

    public function currentDriver()
    {
        return $this->belongsTo(Driver::class, 'current_driver_id');
    }

    public function activityChanges()
    {
        return $this->hasMany(ActivityChange::class);
    }
}
