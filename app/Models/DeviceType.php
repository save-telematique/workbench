<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeviceType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'manufacturer',
    ];

    /**
     * Get the devices that are of this type.
     */
    public function devices()
    {
        return $this->hasMany(Device::class);
    }
} 