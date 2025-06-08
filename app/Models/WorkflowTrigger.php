<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowTrigger extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workflow_id',
        'event_type',
        'source_model',
        'event_data',
        'order',
    ];

    protected $casts = [
        'event_data' => 'json',
        'order' => 'integer',
    ];

    /**
     * Get the workflow that owns this trigger.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
} 