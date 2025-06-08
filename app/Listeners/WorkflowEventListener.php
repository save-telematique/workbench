<?php

namespace App\Listeners;

use App\Events\WorkflowTriggered;
use App\Services\WorkflowEngine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class WorkflowEventListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        protected WorkflowEngine $workflowEngine
    ) {}

    /**
     * Handle the event.
     */
    public function handle(WorkflowTriggered $event): void
    {
        Log::info('WorkflowEventListener: Processing workflow event', [
            'event_type' => $event->eventType->value,
            'model_type' => $event->getModelType(),
            'model_id' => $event->getModelId(),
            'tenant_id' => $event->getTenantId(),
        ]);

        try {
            $this->workflowEngine->processEvent($event);
        } catch (\Exception $e) {
            Log::error('WorkflowEventListener: Failed to process workflow event', [
                'event_type' => $event->eventType->value,
                'model_type' => $event->getModelType(),
                'model_id' => $event->getModelId(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw to ensure the job fails and can be retried
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(WorkflowTriggered $event, \Throwable $exception): void
    {
        Log::error('WorkflowEventListener: Workflow event processing failed permanently', [
            'event_type' => $event->eventType->value,
            'model_type' => $event->getModelType(),
            'model_id' => $event->getModelId(),
            'error' => $exception->getMessage(),
        ]);
    }
} 