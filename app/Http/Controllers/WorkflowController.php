<?php

namespace App\Http\Controllers;

use App\Actions\Workflows\UpdateWorkflowAction;
use App\Enum\WorkflowActionType;
use App\Enum\WorkflowConditionOperator;
use App\Enum\WorkflowEventType;
use App\Http\Resources\WorkflowResource;
use App\Models\Workflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkflowController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Workflow::class, 'workflow');
    }

    /**
     * Display a listing of workflows.
     */
    public function index(Request $request): Response
    {
        $query = Workflow::withCount(['triggers', 'conditions', 'actions']);

        // Use Scout search when search term is provided
        if ($request->filled('search')) {
            $searchQuery = $request->search;
            
            // For search, get the models directly with counts
            $workflowIds = Workflow::search($searchQuery)
                ->when($request->has('is_active'), function ($builder) use ($request) {
                    return $builder->where('is_active', $request->boolean('is_active'));
                })
                ->when($request->user()->tenant_id, function ($builder) use ($request) {
                    // Filter by tenant for tenant users
                    return $builder->where('tenant_id', $request->user()->tenant_id);
                })
                ->keys();
                
            $workflows = Workflow::whereIn('id', $workflowIds)
                ->withCount(['triggers', 'conditions', 'actions'])
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString();
        } else {
            // Standard database query when no search
            $workflows = $query
                ->when($request->has('is_active'), function ($query) use ($request) {
                    $query->where('is_active', $request->boolean('is_active'));
                })
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString();
        }

        return Inertia::render('workflows/index', [
            'workflows' => WorkflowResource::collection($workflows),
            'filters' => [
                'search' => $request->search,
                'is_active' => $request->boolean('is_active'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new workflow.
     */
    public function create(): Response
    {
        return Inertia::render('workflows/create', [
            'events' => $this->getAvailableEvents(),
            'operators' => $this->getAvailableOperators(),
            'actionTypes' => $this->getAvailableActionTypes(),
        ]);
    }

    /**
     * Display the specified workflow.
     */
    public function show(Workflow $workflow): Response
    {
        $workflow->load([
            'triggers' => function ($query) {
                $query->orderBy('order');
            },
            'conditions' => function ($query) {
                $query->orderBy('group_id')->orderBy('order');
            },
            'actions' => function ($query) {
                $query->orderBy('order');
            },
            'executions' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        return Inertia::render('workflows/show', [
            'workflow' => new WorkflowResource($workflow),
        ]);
    }

    /**
     * Show the form for editing the specified workflow.
     */
    public function edit(Workflow $workflow): Response
    {
        $workflow->load(['triggers', 'conditions', 'actions']);

        return Inertia::render('workflows/edit', [
            'workflow' => new WorkflowResource($workflow),
            'events' => $this->getAvailableEvents(),
            'operators' => $this->getAvailableOperators(),
            'actionTypes' => $this->getAvailableActionTypes(),
        ]);
    }

    /**
     * Update the specified workflow.
     */
    public function update(Request $request, Workflow $workflow)
    {
        return (new UpdateWorkflowAction())->handle($workflow, $request->all());
    }

    /**
     * Remove the specified workflow.
     */
    public function destroy(Workflow $workflow)
    {
        try {
            $workflow->delete();

            return to_route('workflows.index')
                ->with('success', __('workflows.messages.deleted'));
        } catch (\Exception $e) {
            return back()->with('error', __('workflows.messages.deletion_failed'));
        }
    }

    /**
     * Display workflow executions.
     */
    public function executions(Request $request, Workflow $workflow): Response
    {
        $this->authorize('view', $workflow);

        // Get paginated executions
        $executions = $workflow->executions()
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('workflows/executions', [
            'workflow' => new WorkflowResource($workflow),
            'executions' => $executions,
        ]);
    }

    /**
     * Get available events from the WorkflowEventType enum.
     */
    private function getAvailableEvents(): array
    {
        $events = [];
        $groupedEvents = WorkflowEventType::grouped();

        foreach ($groupedEvents as $category => $eventTypes) {
            $categoryLabel = __("workflows.event_categories.{$category}");
            
            foreach ($eventTypes as $eventType) {
                $events[] = [
                    'key' => $eventType->value,
                    'label' => $eventType->label(),
                    'category' => $categoryLabel,
                ];
            }
        }

        return $events;
    }

    /**
     * Get available operators from the WorkflowConditionOperator enum.
     */
    private function getAvailableOperators(): array
    {
        $operators = [];
        $groupedOperators = WorkflowConditionOperator::grouped();

        foreach ($groupedOperators as $category => $operatorTypes) {
            foreach ($operatorTypes as $operatorType) {
                $operators[] = [
                    'key' => $operatorType->value,
                    'label' => $operatorType->label(),
                    'category' => __("workflows.operator_categories.{$category}"),
                    'requires_value' => $operatorType->requiresValue(),
                    'value_type' => $operatorType->valueType(),
                ];
            }
        }

        return $operators;
    }

    /**
     * Get available action types from the WorkflowActionType enum.
     */
    private function getAvailableActionTypes(): array
    {
        $actionTypes = [];
        $groupedActions = WorkflowActionType::grouped();

        foreach ($groupedActions as $category => $actionTypeList) {
            $categoryLabel = __("workflows.action_categories.{$category}");
            
            foreach ($actionTypeList as $actionType) {
                $actionTypes[] = [
                    'key' => $actionType->value,
                    'label' => $actionType->label(),
                    'category' => $categoryLabel,
                    'applicable_models' => $actionType->applicableModels(),
                    'required_parameters' => $actionType->requiredParameters(),
                ];
            }
        }

        return $actionTypes;
    }
} 