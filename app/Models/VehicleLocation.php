<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;
use Laravel\Scout\Searchable;
use Stancl\Tenancy\Database\Concerns\BelongsToPrimaryModel;

class VehicleLocation extends Model
{
    use HasFactory, BelongsToPrimaryModel, HasUuids;

    public function getRelationshipToPrimaryModel(): string
    {
        return 'vehicle';
    }

    protected $fillable = [
        'vehicle_id',
        'latitude',
        'longitude',
        'speed',
        'heading',
        'satellites',
        'ignition',
        'moving',
        'altitude',
        'address',
        'address_details',
        'recorded_at',
        'device_message_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'speed' => 'integer',
        'heading' => 'integer',
        'satellites' => 'integer',
        'ignition' => 'boolean',
        'moving' => 'boolean',
        'altitude' => 'integer',
        'address_details' => 'json',
        'recorded_at' => 'datetime',
    ];

    /**
     * Get the vehicle that owns the location.
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the device message related to this location.
     */
    public function deviceMessage()
    {
        return $this->belongsTo(DeviceMessage::class);
    }

    /**
     * Modify the query used to retrieve models when making all models searchable.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->with(['vehicle', 'vehicle.model', 'vehicle.model.vehicleBrand']);
    }
} 