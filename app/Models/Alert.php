<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'severity',
        'metadata',
        'alertable_type',
        'alertable_id',
        'tenant_id',
        'created_by',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'metadata' => 'array',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the entity that this alert belongs to.
     */
    public function alertable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the tenant that owns the alert.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the user who created the alert.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the users who have interacted with this alert.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('read_at')
            ->withTimestamps();
    }

    /**
     * Scope a query to only include active alerts.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }



    /**
     * Mark the alert as read for a specific user.
     */
    public function markAsReadFor(User $user): void
    {
        $this->users()->syncWithoutDetaching([
            $user->id => ['read_at' => now()]
        ]);
    }

    /**
     * Mark the alert as unread for a specific user.
     */
    public function markAsUnreadFor(User $user): void
    {
        $this->users()->syncWithoutDetaching([
            $user->id => ['read_at' => null]
        ]);
    }

    /**
     * Check if the alert is read by a specific user.
     */
    public function isReadBy(User $user): bool
    {
        return $this->users()
            ->where('user_id', $user->id)
            ->whereNotNull('read_at')
            ->exists();
    }

    /**
     * Get the human-readable severity.
     */
    public function getSeverityLabelAttribute(): string
    {
        return match ($this->severity) {
            'info' => __('alerts.severity.info'),
            'warning' => __('alerts.severity.warning'),
            'error' => __('alerts.severity.error'),
            'success' => __('alerts.severity.success'),
            default => __('alerts.severity.info'),
        };
    }

    /**
     * Get the severity color for UI display.
     */
    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            'info' => 'blue',
            'warning' => 'yellow',
            'error' => 'red',
            'success' => 'green',
            default => 'blue',
        };
    }

    /**
     * Check if the alert is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
} 