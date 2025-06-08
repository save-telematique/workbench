<?php

namespace App\Services;

use App\Events\WorkflowTriggered;
use App\Enum\WorkflowConditionOperator;
use App\Models\WorkflowCondition;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Exception;

class WorkflowConditionEvaluator
{
    /**
     * Evaluate all conditions for a workflow.
     */
    public function evaluate(Collection $conditions, WorkflowTriggered $event): bool
    {
        if ($conditions->isEmpty()) {
            return true;
        }

        // Group conditions by group_id
        $conditionGroups = $conditions->groupBy('group_id');

        // Evaluate each group (groups are combined with OR logic)
        foreach ($conditionGroups as $groupId => $groupConditions) {
            if ($this->evaluateConditionGroup($groupConditions, $event)) {
                return true; // If any group passes, the whole condition set passes
            }
        }

        return false; // No group passed
    }

    /**
     * Evaluate a group of conditions (within a group, conditions are combined with AND/OR logic).
     */
    protected function evaluateConditionGroup(Collection $conditions, WorkflowTriggered $event): bool
    {
        $result = null;
        $currentOperator = 'AND';

        foreach ($conditions->sortBy('order') as $condition) {
            $conditionResult = $this->evaluateCondition($condition, $event);

            if ($result === null) {
                $result = $conditionResult;
            } else {
                if ($currentOperator === 'AND') {
                    $result = $result && $conditionResult;
                } else {
                    $result = $result || $conditionResult;
                }
            }

            // Set operator for next condition
            $currentOperator = $condition->logical_operator;
        }

        return $result ?? false;
    }

    /**
     * Evaluate a single condition.
     */
    protected function evaluateCondition(WorkflowCondition $condition, WorkflowTriggered $event): bool
    {
        try {
            $fieldValue = $this->extractFieldValue($condition->field_path, $event);
            $operator = WorkflowConditionOperator::from($condition->operator);
            $conditionValue = $condition->value;

            return $this->compareValues($fieldValue, $operator, $conditionValue, $event);

        } catch (Exception $e) {
            Log::error('WorkflowConditionEvaluator: Failed to evaluate condition', [
                'condition_id' => $condition->id,
                'field_path' => $condition->field_path,
                'operator' => $condition->operator,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Extract field value from the event data using dot notation.
     */
    protected function extractFieldValue(string $fieldPath, WorkflowTriggered $event): mixed
    {
        $parts = explode('.', $fieldPath);
        $value = null;

        // Special handling for model data
        if ($parts[0] === 'model') {
            $value = $event->sourceModel;
            $parts = array_slice($parts, 1); // Remove 'model' from path
        } 
        // Event data
        elseif ($parts[0] === 'event') {
            $value = $event->eventData;
            $parts = array_slice($parts, 1); // Remove 'event' from path
        }
        // Previous data
        elseif ($parts[0] === 'previous') {
            $value = $event->previousData;
            $parts = array_slice($parts, 1); // Remove 'previous' from path
        }
        // Direct access to event data
        else {
            $value = $event->eventData;
        }

        // Navigate through the path
        foreach ($parts as $part) {
            if (is_array($value)) {
                $value = $value[$part] ?? null;
            } elseif (is_object($value)) {
                if (isset($value->$part)) {
                    $value = $value->$part;
                } elseif (method_exists($value, $part)) {
                    $value = $value->$part();
                } else {
                    $value = null;
                }
            } else {
                $value = null;
                break;
            }
        }

        return $value;
    }

    /**
     * Compare values using the specified operator.
     */
    protected function compareValues(mixed $fieldValue, WorkflowConditionOperator $operator, mixed $conditionValue, WorkflowTriggered $event): bool
    {
        return match ($operator) {
            WorkflowConditionOperator::EQUALS => $fieldValue == $conditionValue,
            WorkflowConditionOperator::NOT_EQUALS => $fieldValue != $conditionValue,
            WorkflowConditionOperator::GREATER_THAN => $fieldValue > $conditionValue,
            WorkflowConditionOperator::GREATER_THAN_OR_EQUAL => $fieldValue >= $conditionValue,
            WorkflowConditionOperator::LESS_THAN => $fieldValue < $conditionValue,
            WorkflowConditionOperator::LESS_THAN_OR_EQUAL => $fieldValue <= $conditionValue,
            
            WorkflowConditionOperator::CONTAINS => is_string($fieldValue) && str_contains($fieldValue, $conditionValue),
            WorkflowConditionOperator::NOT_CONTAINS => is_string($fieldValue) && !str_contains($fieldValue, $conditionValue),
            
            WorkflowConditionOperator::IS_NULL => $fieldValue === null,
            WorkflowConditionOperator::IS_NOT_NULL => $fieldValue !== null,
            
            WorkflowConditionOperator::IS_TRUE => $fieldValue === true,
            WorkflowConditionOperator::IS_FALSE => $fieldValue === false,
            
            WorkflowConditionOperator::CHANGED => $this->evaluateChangeCondition($fieldValue, $event),
            WorkflowConditionOperator::CHANGED_FROM => $this->evaluateChangeFromCondition($fieldValue, $conditionValue, $event),
            WorkflowConditionOperator::CHANGED_TO => $this->evaluateChangeToCondition($fieldValue, $conditionValue, $event),
        };
    }

    /**
     * Evaluate change condition.
     */
    protected function evaluateChangeCondition(mixed $currentValue, WorkflowTriggered $event): bool
    {
        return $event->previousData !== null && $currentValue !== $event->previousData;
    }

    /**
     * Evaluate change from condition.
     */
    protected function evaluateChangeFromCondition(mixed $currentValue, mixed $fromValue, WorkflowTriggered $event): bool
    {
        return $event->previousData == $fromValue && $currentValue != $fromValue;
    }

    /**
     * Evaluate change to condition.
     */
    protected function evaluateChangeToCondition(mixed $currentValue, mixed $toValue, WorkflowTriggered $event): bool
    {
        return $currentValue == $toValue && ($event->previousData === null || $event->previousData != $toValue);
    }
} 