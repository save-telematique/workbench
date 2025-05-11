<?php

namespace App\Models;

use App\Traits\HasHyperTable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class DeviceDataPoint extends Model
{
    use HasFactory, HasHyperTable;

    protected $primaryKey = null;
    public $incrementing = false;
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


    /**
     * Modify the query used to retrieve models when making all models searchable.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->with(['device', 'vehicle', 'dataPointType']);
    }

    /**
     * Get the scout key for the model.
     *
     * @return mixed
     */
    public function getScoutKey()
    {
        return md5($this->device_id . $this->recorded_at->timestamp . $this->data_point_type_id);
    }

    /**
     * Get the key name used to index the model.
     * 
     * @return mixed
     */
    public function getScoutKeyName()
    {
        return 'id';
    }
}
