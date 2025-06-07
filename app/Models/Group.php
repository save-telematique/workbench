<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Group extends Model
{
    use HasFactory, Searchable, BelongsToTenant, SoftDeletes, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'color',
        'parent_id',
        'tenant_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * The tenant this group belongs to
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * The parent group
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'parent_id');
    }

    /**
     * The child groups
     */
    public function children(): HasMany
    {
        return $this->hasMany(Group::class, 'parent_id');
    }

    /**
     * All descendant groups (recursive)
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Users assigned to this group
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_groups');
    }

    /**
     * Vehicles in this group
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Drivers in this group
     */
    public function drivers(): HasMany
    {
        return $this->hasMany(Driver::class);
    }

    /**
     * Get all ancestor groups
     */
    public function ancestors()
    {
        $ancestors = collect();
        $this->load('parent');
        $parent = $this->parent;
        
        
        while ($parent) {
            $ancestors->push($parent);
            $parent = $parent->parent;
        }
        
        return $ancestors;
    }

    /**
     * Get the full path of the group (including ancestors)
     */
    public function getFullPathAttribute(): string
    {
        $ancestors = $this->ancestors()->reverse();
        $path = $ancestors->pluck('name')->push($this->name);
        
        return $path->join(' > ');
    }

    /**
     * Get all descendant group IDs (including self)
     */
    public function getAllDescendantIds(): array
    {
        $ids = [$this->id];
        
        $children = $this->children()->get();
        foreach ($children as $child) {
            $ids = array_merge($ids, $child->getAllDescendantIds());
        }
        
        return $ids;
    }

    /**
     * Check if this group is a descendant of another group
     */
    public function isDescendantOf(Group $group): bool
    {
        return $this->ancestors()->contains('id', $group->id);
    }

    /**
     * Scope to active groups
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to root groups (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to groups for a specific tenant
     */
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => (string) $this->name,
            'description' => (string) $this->description,
            'tenant_id' => (string) $this->tenant_id,
            'parent_id' => $this->parent_id ? (string) $this->parent_id : null,
            'full_path' => (string) $this->full_path,
            'is_active' => (bool) $this->is_active,
            'tenant_name' => (string) $this->tenant?->name,
            'parent_name' => (string) $this->parent?->name,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
        ];
    }

    /**
     * Modify the query used to retrieve models when making all of the models searchable.
     */
    protected function makeAllSearchableUsing(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->with(['tenant', 'parent']);
    }
} 