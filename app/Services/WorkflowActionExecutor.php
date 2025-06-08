<?php

namespace App\Services;

use App\Events\WorkflowTriggered;
use App\Enum\WorkflowActionType;
use App\Models\Alert;
use App\Models\WorkflowAction;
use App\Models\WorkflowExecution;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class WorkflowActionExecutor
{
    /**
     * Execute a workflow action.
     */
    public function execute(WorkflowAction $action, WorkflowTriggered $event, WorkflowExecution $execution): array
    {
        try {
            $actionType = WorkflowActionType::from($action->action_type);
            $parameters = $action->parameters;

            return match ($actionType) {
                WorkflowActionType::LOG_ALERT => $this->logAlert($parameters, $event),
                WorkflowActionType::CREATE_ALERT => $this->createAlert($parameters, $event),
                default => ['success' => false, 'error' => "Unsupported action type: {$action->action_type}"],
            };

        } catch (Exception $e) {
            Log::error('WorkflowActionExecutor: Action execution failed', [
                'action_id' => $action->id,
                'action_type' => $action->action_type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Log an alert to a file.
     */
    protected function logAlert(array $parameters, WorkflowTriggered $event): array
    {
        $message = $this->interpolateText($parameters['message'] ?? 'Alert triggered', $event);
        $level = $parameters['level'] ?? 'info';
        
        $tenantId = $event->getTenantId();
        $timestamp = now()->format('Y-m-d H:i:s');
        
        // Create log entry
        $logEntry = [
            'timestamp' => $timestamp,
            'tenant_id' => $tenantId,
            'event_type' => $event->eventType->value,
            'source_model' => $event->getModelType(),
            'source_id' => $event->getModelId(),
            'level' => $level,
            'message' => $message,
            'event_data' => $event->eventData,
        ];
        
        // Write to file
        $filename = $tenantId ? "workflow-alerts-tenant-{$tenantId}.log" : 'workflow-alerts-central.log';
        $logLine = json_encode($logEntry) . "\n";
        
        try {
            Storage::disk('local')->append("workflows/{$filename}", $logLine);
        } catch (Exception $e) {
            Log::error('Failed to write workflow alert to file', [
                'filename' => $filename,
                'error' => $e->getMessage(),
            ]);
        }
        
        // Also log to Laravel's logging system
        Log::log($level, 'Workflow Alert: ' . $message, [
            'workflow_event' => $event->eventType->value,
            'source_model' => $event->getModelType(),
            'source_id' => $event->getModelId(),
            'tenant_id' => $tenantId,
            'event_data' => $event->eventData,
        ]);
        
        return [
            'success' => true,
            'data' => [
                'message' => $message,
                'level' => $level,
                'filename' => $filename,
                'logged_at' => $timestamp,
            ],
        ];
    }

    /**
     * Interpolate text with event data.
     */
    protected function interpolateText(string $text, WorkflowTriggered $event): string
    {
        $replacements = [
            '{model.id}' => $event->getModelId(),
            '{model.type}' => $event->getModelType(),
            '{event.type}' => $event->eventType->value,
            '{tenant.id}' => $event->getTenantId() ?? 'central',
            '{timestamp}' => now()->format('Y-m-d H:i:s'),
        ];

        // Add event data replacements
        foreach ($event->eventData as $key => $value) {
            if (is_scalar($value)) {
                $replacements["{event.{$key}}"] = $value;
            }
        }

        // Add model data replacements if it's a Vehicle
        if ($event->sourceModel instanceof \App\Models\Vehicle) {
            $vehicle = $event->sourceModel;
            $replacements['{vehicle.name}'] = $vehicle->name ?? 'Unknown';
            $replacements['{vehicle.registration}'] = $vehicle->registration ?? 'Unknown';
        }

        return strtr($text, $replacements);
    }

    /**
     * Create an alert based on workflow parameters.
     */
    protected function createAlert(array $parameters, WorkflowTriggered $event): array
    {
        // Validate required parameters
        $requiredParams = ['title', 'content', 'severity'];
        foreach ($requiredParams as $param) {
            if (!isset($parameters[$param])) {
                return [
                    'success' => false,
                    'error' => "Missing required parameter: {$param}"
                ];
            }
        }

        // Validate severity
        $validSeverities = ['info', 'warning', 'error', 'success'];
        if (!in_array($parameters['severity'], $validSeverities)) {
            return [
                'success' => false,
                'error' => "Invalid severity. Must be one of: " . implode(', ', $validSeverities)
            ];
        }

        // Interpolate parameter values
        $title = $this->interpolateText($parameters['title'], $event);
        $content = $this->interpolateText($parameters['content'], $event);
        $severity = $parameters['severity']; // Severity should not be interpolated for validation
        
        // Optional parameters with interpolation
        $expiresAt = isset($parameters['expires_at']) 
            ? $this->interpolateText($parameters['expires_at'], $event) 
            : null;
        
        $metadata = $parameters['metadata'] ?? [];
        
        // If metadata contains string values, interpolate them
        if (is_array($metadata)) {
            $metadata = $this->interpolateMetadata($metadata, $event);
        }

        try {
            // Create the alert
            $alertData = [
                'title' => $title,
                'content' => $content,
                'severity' => $severity,
                'alertable_type' => get_class($event->sourceModel),
                'alertable_id' => $event->getModelId(),
                'tenant_id' => $event->getTenantId(),
                'metadata' => $metadata,
                'is_active' => true,
            ];

            // Add expires_at if provided and valid
            if ($expiresAt) {
                try {
                    $alertData['expires_at'] = \Carbon\Carbon::parse($expiresAt);
                } catch (\Exception $e) {
                    Log::warning('Invalid expires_at format in create alert action', [
                        'expires_at' => $expiresAt,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $alert = Alert::create($alertData);

            return [
                'success' => true,
                'data' => [
                    'alert_id' => $alert->id,
                    'title' => $title,
                    'content' => $content,
                    'severity' => $severity,
                    'alertable_type' => $alertData['alertable_type'],
                    'alertable_id' => $alertData['alertable_id'],
                    'tenant_id' => $alertData['tenant_id'],
                    'created_at' => $alert->created_at->toISOString(),
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Failed to create alert from workflow', [
                'parameters' => $parameters,
                'event_type' => $event->eventType->value,
                'source_model' => $event->getModelType(),
                'source_id' => $event->getModelId(),
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create alert: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Recursively interpolate metadata values.
     */
    protected function interpolateMetadata(array $metadata, WorkflowTriggered $event): array
    {
        $interpolated = [];
        
        foreach ($metadata as $key => $value) {
            if (is_string($value)) {
                $interpolated[$key] = $this->interpolateText($value, $event);
            } elseif (is_array($value)) {
                $interpolated[$key] = $this->interpolateMetadata($value, $event);
            } else {
                $interpolated[$key] = $value;
            }
        }
        
        return $interpolated;
    }
} 