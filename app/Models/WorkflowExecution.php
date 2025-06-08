<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowExecution extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workflow_id',
        'triggered_by',
        'trigger_data',
        'status',
        'execution_log',
        'started_at',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'trigger_data' => 'json',
        'execution_log' => 'json',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the workflow that owns this execution.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    /**
     * Mark the execution as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the execution as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Add a log entry to the execution log.
     */
    public function addLogEntry(string $message, array $data = []): void
    {
        $log = $this->execution_log ?? [];
        $log[] = [
            'timestamp' => now()->toISOString(),
            'message' => $message,
            'data' => $data,
        ];
        
        $this->update(['execution_log' => $log]);
    }
} 