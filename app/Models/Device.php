<?php

namespace App\Models;

use App\Events\DeviceCreated;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;
use App\Traits\HasAlerts;

class Device extends Model
{
    use HasFactory, HasUuids, BelongsToTenant, Searchable, SoftDeletes, HasAlerts;

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

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'created' => DeviceCreated::class,
    ];

    /**
     * The attributes that should be appended to the model's array representation.
     *
     * @var array
     */
    protected $appends = ['is_online', 'name'];

    /**
     * Determine if the device is online.
     * A device is considered online if it has communicated within the last 15 minutes.
     */
    protected function isOnline(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->last_contact_at) {
                    return false;
                }
                return $this->last_contact_at->diffInMinutes(now()) <= 15;
            }
        );
    }

    /**
     * Get the device name (serial number or IMEI if no serial number).
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->serial_number ?: $this->imei ?: __('devices.unknown_device');
            }
        );
    }

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
            'imei' => (string) $this->imei,
            'sim_number' => (string) $this->sim_number,
            'serial_number' => (string) $this->serial_number,
            'type_name' => (string) $this->type?->name,
            'type_manufacturer' => (string) $this->type?->manufacturer,
            'tenant_name' => (string) $this->tenant?->name,
            'vehicle_id' => (string) $this->vehicle_id,
            'vehicle_registration' => (string) $this->vehicle?->registration,
            'vehicle_model' => (string) $this->vehicle?->model?->name,
            'vehicle_brand' => (string) $this->vehicle?->model?->vehicleBrand?->name,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
            '__soft_deleted' => (bool) $this->trashed(),
        ];

        return $array;
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
