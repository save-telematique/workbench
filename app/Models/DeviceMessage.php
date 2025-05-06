<?php

namespace App\Models;

use App\Jobs\ProcessDeviceMessage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToPrimaryModel;

class DeviceMessage extends Model
{
    use HasFactory, BelongsToPrimaryModel;

    // Auto-incrementing ID is used by default
    protected $keyType = 'int';
    public $incrementing = true;

    public function getRelationshipToPrimaryModel(): string
    {
        return 'device';
    }

    protected $fillable = [
        'device_id',
        'message',
        'ip',
        'processed_at',
    ];

    protected $casts = [
        'message' => 'json',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the device that sent this message.
     */
    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Get the vehicle location generated from this message.
     */
    public function location()
    {
        return $this->hasOne(VehicleLocation::class, 'device_message_id');
    }

    public function process()
    {
        dispatch(new ProcessDeviceMessage($this));
    }
} 