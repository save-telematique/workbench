<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceDataPoint extends Model
{
    use HasFactory;

    // Disable timestamps as they are not in the migration
    public $timestamps = false;

    protected $fillable = [
        'device_message_id',
        'device_id',
        'vehicle_id',
        'data_point_type_id',
        'value',
        'recorded_at',
    ];

    protected $casts = [
        'value' => 'json', // Casts to array/object or appropriate primitive from JSONB
        'recorded_at' => 'datetime',
    ];

    /**
     * Get the type of this data point.
     */
    public function dataPointType()
    {
        return $this->belongsTo(DataPointType::class, 'data_point_type_id');
    }

    /**
     * Get the device that this data point belongs to.
     */
    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Get the vehicle that this data point belongs to.
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the original device message this data point came from.
     */
    public function deviceMessage()
    {
        return $this->belongsTo(DeviceMessage::class);
    }
}
