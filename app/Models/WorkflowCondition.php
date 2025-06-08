<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowCondition extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workflow_id',
        'field_path',
        'operator',
        'value',
        'logical_operator',
        'group_id',
        'order',
    ];

    protected $casts = [
        'value' => 'json',
        'group_id' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get the workflow that owns this condition.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
} 