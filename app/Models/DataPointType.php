<?php

namespace App\Models;

use App\Enum\DataPointDataType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataPointType extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'integer';

    protected $fillable = [
        'name',
        'description',
        'data_type',
        'unit',
        'category',
        'processing_steps',
    ];

    protected $casts = [
        'data_type' => DataPointDataType::class,
        'processing_steps' => 'json',
    ];

    /**
     * Get the data points of this type.
     */
    public function dataPoints()
    {
        return $this->hasMany(DeviceDataPoint::class);
    }
}
