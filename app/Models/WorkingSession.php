<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'working_day_id',
        'vehicle_id',
        'started_at',
        'ended_at',
        'activity_id',
        'type',
        'driving_time',
        'break_needed_in',
        'next_break_duration',
        'remaining_driving_time',
        'remaining_weekly_driving_time',
        'weekly_driving_time',
        'weekly_exceedeed_driving_limit',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function getDurationAttribute(): int
    {
        return round($this->started_at->diffInMinutes($this->ended_at ?? now()));
    }

    public function workingDay(): BelongsTo
    {
        return $this->belongsTo(WorkingDay::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
