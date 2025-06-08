<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;

class Workflow extends Model
{
    use HasFactory, BelongsToTenant, HasUuids, SoftDeletes, Searchable;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'json',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => (string) $this->id,
            'tenant_id' => (string) $this->tenant_id,
            'name' => (string) $this->name,
            'description' => (string) ($this->description ?? ''),
            'is_active' => (bool) $this->is_active,
            'tenant_name' => (string) ($this->tenant?->name ?? ''),
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
            '__soft_deleted' => (bool) $this->trashed(),
        ];
    }



    /**
     * Modify the query used to retrieve models when making all models searchable.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with(['tenant']);
    }

    /**
     * Get the tenant that owns the workflow.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the triggers for this workflow.
     */
    public function triggers(): HasMany
    {
        return $this->hasMany(WorkflowTrigger::class)->orderBy('order');
    }

    /**
     * Get the conditions for this workflow.
     */
    public function conditions(): HasMany
    {
        return $this->hasMany(WorkflowCondition::class)->orderBy('group_id')->orderBy('order');
    }

    /**
     * Get the actions for this workflow.
     */
    public function actions(): HasMany
    {
        return $this->hasMany(WorkflowAction::class)->orderBy('order');
    }

    /**
     * Get the executions for this workflow.
     */
    public function executions(): HasMany
    {
        return $this->hasMany(WorkflowExecution::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the recent executions for this workflow.
     */
    public function recentExecutions(): HasMany
    {
        return $this->executions()->where('created_at', '>=', now()->subWeek());
    }

    /**
     * Scope for active workflows.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if this workflow should be triggered by the given event.
     */
    public function shouldTrigger(string $eventType, array $eventData = []): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return $this->triggers()
            ->where('event_type', $eventType)
            ->exists();
    }
} 