<?php

namespace App\Services;

use App\Models\Workflow;
use App\Models\WorkflowExecution;
use App\Enum\WorkflowEventType;
use App\Enum\WorkflowConditionOperator;
use App\Enum\WorkflowActionType;
use App\Events\WorkflowTriggered;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class WorkflowEngine
{
    public function __construct(
        protected WorkflowConditionEvaluator $conditionEvaluator,
        protected WorkflowActionExecutor $actionExecutor
    ) {}

    /**
     * Process a workflow triggered event.
     */
    public function processEvent(WorkflowTriggered $event): void
    {
        $tenantId = $event->getTenantId();
        
        if (!$tenantId) {
            Log::warning('WorkflowEngine: Event triggered without tenant context', [
                'event_type' => $event->eventType->value,
                'model_type' => $event->getModelType(),
                'model_id' => $event->getModelId(),
            ]);
            return;
        }

        // Find all active workflows for this tenant that could be triggered by this event
        $workflows = Workflow::where('tenant_id', $tenantId)
            ->active()
            ->whereHas('triggers', function ($query) use ($event) {
                $query->where('event_type', $event->eventType->value);
            })
            ->with(['triggers', 'conditions', 'actions'])
            ->get();

        foreach ($workflows as $workflow) {
            if ($this->shouldExecuteWorkflow($workflow, $event)) {
                $this->executeWorkflow($workflow, $event);
            }
        }
    }

    /**
     * Check if a workflow should be executed based on its conditions.
     */
    protected function shouldExecuteWorkflow(Workflow $workflow, WorkflowTriggered $event): bool
    {
        // If no conditions are defined, execute the workflow
        if ($workflow->conditions->isEmpty()) {
            return true;
        }

        return $this->conditionEvaluator->evaluate($workflow->conditions, $event);
    }

    /**
     * Execute a workflow.
     */
    protected function executeWorkflow(Workflow $workflow, WorkflowTriggered $event): void
    {
        // Create execution record
        $execution = WorkflowExecution::create([
            'workflow_id' => $workflow->id,
            'triggered_by' => $event->eventType->value,
            'trigger_data' => [
                'model_type' => $event->getModelType(),
                'model_id' => $event->getModelId(),
                'event_data' => $event->eventData,
                'previous_data' => $event->previousData,
            ],
            'status' => 'running',
            'started_at' => now(),
        ]);

        $execution->addLogEntry('Workflow execution started', [
            'workflow_name' => $workflow->name,
            'triggered_by' => $event->eventType->value,
        ]);

        try {
            DB::transaction(function () use ($workflow, $event, $execution) {
                foreach ($workflow->actions as $action) {
                    $execution->addLogEntry("Executing action: {$action->action_type}", [
                        'action_id' => $action->id,
                        'action_type' => $action->action_type,
                        'parameters' => $action->parameters,
                    ]);

                    $result = $this->actionExecutor->execute($action, $event, $execution);

                    if (!$result['success']) {
                        $execution->addLogEntry("Action failed: {$result['error']}", [
                            'action_id' => $action->id,
                            'error' => $result['error'],
                        ]);

                        if ($action->stop_on_error) {
                            throw new Exception("Action {$action->action_type} failed: {$result['error']}");
                        }
                    } else {
                        $execution->addLogEntry("Action completed successfully", [
                            'action_id' => $action->id,
                            'result' => $result['data'] ?? null,
                        ]);
                    }
                }
            });

            $execution->markAsCompleted();
            $execution->addLogEntry('Workflow execution completed successfully');

        } catch (Exception $e) {
            $execution->markAsFailed($e->getMessage());
            
            Log::error('WorkflowEngine: Workflow execution failed', [
                'workflow_id' => $workflow->id,
                'execution_id' => $execution->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Test a workflow with sample data without actually executing actions.
     */
    public function testWorkflow(Workflow $workflow, array $sampleData): array
    {
        $results = [
            'triggered' => false,
            'conditions_met' => false,
            'actions_planned' => [],
            'errors' => [],
        ];

        try {
            // Create a mock event for testing
            $mockEvent = new WorkflowTriggered(
                WorkflowEventType::from($workflow->triggers->first()->event_type),
                new class extends Model {
                    protected $fillable = ['*'];
                    public function getKeyName() { return 'id'; }
                    public function getKey() { return $sampleData['model_id'] ?? 'test-id'; }
                },
                $sampleData
            );

            $results['triggered'] = true;

            // Test conditions
            if ($workflow->conditions->isNotEmpty()) {
                $results['conditions_met'] = $this->conditionEvaluator->evaluate($workflow->conditions, $mockEvent);
            } else {
                $results['conditions_met'] = true;
            }

            // Plan actions (without executing)
            if ($results['conditions_met']) {
                foreach ($workflow->actions as $action) {
                    $results['actions_planned'][] = [
                        'action_type' => $action->action_type,
                        'parameters' => $action->parameters,
                        'order' => $action->order,
                    ];
                }
            }

        } catch (Exception $e) {
            $results['errors'][] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Get workflow execution statistics.
     */
    public function getExecutionStats(Workflow $workflow, int $days = 30): array
    {
        $since = now()->subDays($days);

        $executions = $workflow->executions()
            ->where('created_at', '>=', $since)
            ->get();

        return [
            'total_executions' => $executions->count(),
            'successful_executions' => $executions->where('status', 'completed')->count(),
            'failed_executions' => $executions->where('status', 'failed')->count(),
            'average_execution_time' => $executions
                ->whereNotNull('completed_at')
                ->avg(function ($execution) {
                    return $execution->started_at->diffInSeconds($execution->completed_at);
                }),
            'last_execution' => $executions->first()?->created_at,
            'recent_errors' => $executions
                ->where('status', 'failed')
                ->take(5)
                ->pluck('error_message')
                ->toArray(),
        ];
    }
} 