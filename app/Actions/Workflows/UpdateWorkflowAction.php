<?php

namespace App\Actions\Workflows;

use App\Models\Workflow;
use App\Models\WorkflowTrigger;
use App\Models\WorkflowCondition;
use App\Models\WorkflowAction;
use Illuminate\Support\Facades\DB;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateWorkflowAction
{
    use AsAction;

    public function authorize(ActionRequest $request, Workflow $workflow): bool
    {
        return true;
        //return $request->user()->can('update', $workflow);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'metadata' => ['nullable', 'array'],
            
            // Accept JSON strings for workflow builder components
            'triggers' => ['required', 'string'],
            'conditions' => ['nullable', 'string'],
            'actions' => ['required', 'string'],
        ];
    }

    public function getValidationMessages(): array
    {
        return [
            'name.required' => __('workflows.validation.name_required'),
            'triggers.required' => __('workflows.validation.trigger_required'),
            'actions.required' => __('workflows.validation.action_required'),
        ];
    }

    protected function extractSourceModelFromEvent(string $event): string
    {
        // Extract source model from event names like 'vehicle.created', 'device.status_changed', etc.
        if (str_contains($event, '.')) {
            return ucfirst(explode('.', $event)[0]);
        }
        
        // Default fallback
        return 'Vehicle';
    }

    protected function parseAndValidateBuilderData(array $data): array
    {
        // Parse JSON strings
        $triggers = json_decode($data['triggers'] ?? '[]', true);
        $conditions = json_decode($data['conditions'] ?? '[]', true);
        $actions = json_decode($data['actions'] ?? '[]', true);

        // Validate JSON parsing
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON in workflow builder data: ' . json_last_error_msg());
        }

        // Validate triggers structure
        if (!is_array($triggers) || empty($triggers)) {
            throw new \InvalidArgumentException(__('workflows.validation.trigger_required'));
        }

        foreach ($triggers as $index => $trigger) {
            if (!is_array($trigger)) {
                throw new \InvalidArgumentException("Invalid trigger format at index {$index}");
            }

            // Frontend sends 'event' field, not 'event_type' and 'source_model'
            if (empty($trigger['event'])) {
                throw new \InvalidArgumentException("Missing required trigger event at index {$index}");
            }
        }

        // Validate conditions structure (if provided)
        if (!empty($conditions) && is_array($conditions)) {
            foreach ($conditions as $index => $condition) {
                if (!is_array($condition)) {
                    throw new \InvalidArgumentException("Invalid condition format at index {$index}");
                }

                // Frontend sends 'field' and 'operator', not 'field_path'
                if (empty($condition['field']) || empty($condition['operator'])) {
                    throw new \InvalidArgumentException("Missing required condition fields at index {$index}");
                }
            }
        }

        // Validate actions structure
        if (!is_array($actions) || empty($actions)) {
            throw new \InvalidArgumentException(__('workflows.validation.action_required'));
        }

        foreach ($actions as $index => $action) {
            if (!is_array($action)) {
                throw new \InvalidArgumentException("Invalid action format at index {$index}");
            }

            if (empty($action['action_type']) || !isset($action['parameters'])) {
                throw new \InvalidArgumentException("Missing required action fields at index {$index}");
            }
        }

        return [
            'triggers' => $triggers,
            'conditions' => $conditions,
            'actions' => $actions,
        ];
    }

    public function handle(Workflow $workflow, array $data): Workflow
    {
        return DB::transaction(function () use ($workflow, $data) {
            // Parse and validate the builder data
            $builderData = $this->parseAndValidateBuilderData($data);

            // Update the workflow
            $workflow->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'metadata' => $data['metadata'] ?? null,
            ]);

            // Delete existing triggers, conditions, and actions
            $workflow->triggers()->delete();
            $workflow->conditions()->delete();
            $workflow->actions()->delete();

            // Create new triggers
            foreach ($builderData['triggers'] as $index => $triggerData) {
                // Map frontend structure to database structure
                WorkflowTrigger::create([
                    'workflow_id' => $workflow->id,
                    'event_type' => $triggerData['event'], // Frontend sends 'event', map to 'event_type'
                    'source_model' => $this->extractSourceModelFromEvent($triggerData['event']),
                    'event_data' => $triggerData['conditions'] ?? null,
                    'order' => $triggerData['order'] ?? $index,
                ]);
            }

            // Create new conditions (if any)
            if (!empty($builderData['conditions'])) {
                foreach ($builderData['conditions'] as $index => $conditionData) {
                    WorkflowCondition::create([
                        'workflow_id' => $workflow->id,
                        'field_path' => $conditionData['field'], // Frontend sends 'field', map to 'field_path'
                        'operator' => $conditionData['operator'],
                        'value' => $conditionData['value'] ?? null,
                        'logical_operator' => $conditionData['logical_operator'] ?? 'AND',
                        'group_id' => $conditionData['group_id'] ?? 0,
                        'order' => $conditionData['order'] ?? $index,
                    ]);
                }
            }

            // Create new actions
            foreach ($builderData['actions'] as $index => $actionData) {
                WorkflowAction::create([
                    'workflow_id' => $workflow->id,
                    'action_type' => $actionData['action_type'],
                    'target_model' => $actionData['target_model'] ?? null,
                    'parameters' => $actionData['parameters'],
                    'order' => $actionData['order'] ?? $index,
                    'stop_on_error' => $actionData['stop_on_error'] ?? false,
                ]);
            }

            return $workflow->load(['triggers', 'conditions', 'actions']);
        });
    }

    public function asController(ActionRequest $request, Workflow $workflow)
    {
        $workflow = $this->handle($workflow, $request->validated());

        return to_route('workflows.show', $workflow)
            ->with('success', __('workflows.messages.updated'));
    }
} 