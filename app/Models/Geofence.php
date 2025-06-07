<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;

class Geofence extends Model
{
    use HasFactory, BelongsToTenant, HasUuids, SoftDeletes, Searchable;

    protected $fillable = [
        'tenant_id',
        'group_id',
        'name',
        'geojson',
        'is_active',
    ];

    protected $casts = [
        'geojson' => 'json',
        'is_active' => 'boolean',
    ];

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return [
            'id' => (string) $this->id,
            'tenant_id' => (string) $this->tenant_id,
            'name' => (string) $this->name,
            'group_name' => (string) $this->group?->name,
            'tenant_name' => (string) $this->tenant?->name,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
            '__soft_deleted' => (bool) $this->trashed(),
        ];
    }

    /**
     * Modify the query used to retrieve models when making all models searchable.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with(['group', 'tenant']);
    }

    /**
     * Get the tenant that owns the geofence.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the group that the geofence optionally belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Scope for active geofences.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if a coordinate point is within this geofence.
     * This method would need a geometric library for proper implementation.
     */
    public function containsPoint(float $latitude, float $longitude): bool
    {
        // TODO: Implement point-in-polygon algorithm
        // For now, returning false as placeholder
        return false;
    }
} 