<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkingDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'date',
        'driving_time',
        'break_needed_in',
        'next_break_time',
        'remaining_driving_time',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function workingSessions(): HasMany
    {
        return $this->hasMany(WorkingSession::class);
    }
}
