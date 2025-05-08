<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataPointType extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'integer';

    protected $fillable = [
        'id',
        'name',
        'unit',
        'category',
        'processing_steps',
        'description',
    ];

    protected $casts = [
        'processing_steps' => 'array', // Will be cast to array/object from JSONB
    ];

    /**
     * Get the data points associated with this type.
     */
    public function deviceDataPoints()
    {
        return $this->hasMany(DeviceDataPoint::class, 'data_point_type_id');
    }
}
