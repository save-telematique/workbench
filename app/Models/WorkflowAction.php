<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowAction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workflow_id',
        'action_type',
        'target_model',
        'parameters',
        'order',
        'stop_on_error',
    ];

    protected $casts = [
        'parameters' => 'json',
        'order' => 'integer',
        'stop_on_error' => 'boolean',
    ];

    /**
     * Get the workflow that owns this action.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
} 