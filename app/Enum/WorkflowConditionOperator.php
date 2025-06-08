<?php

namespace App\Enum;

enum WorkflowConditionOperator: string
{
    // Basic comparison operators
    case EQUALS = 'equals';
    case NOT_EQUALS = 'not_equals';
    case GREATER_THAN = 'greater_than';
    case GREATER_THAN_OR_EQUAL = 'greater_than_or_equal';
    case LESS_THAN = 'less_than';
    case LESS_THAN_OR_EQUAL = 'less_than_or_equal';
    
    // String operators
    case CONTAINS = 'contains';
    case NOT_CONTAINS = 'not_contains';
    
    // Null operators
    case IS_NULL = 'is_null';
    case IS_NOT_NULL = 'is_not_null';
    
    // Boolean operators
    case IS_TRUE = 'is_true';
    case IS_FALSE = 'is_false';
    
    // Change operators
    case CHANGED = 'changed';
    case CHANGED_FROM = 'changed_from';
    case CHANGED_TO = 'changed_to';

    /**
     * Get human-readable label for the operator.
     */
    public function label(): string
    {
        return match ($this) {
            self::EQUALS => __('workflows.operators.equals'),
            self::NOT_EQUALS => __('workflows.operators.not_equals'),
            self::GREATER_THAN => __('workflows.operators.greater_than'),
            self::GREATER_THAN_OR_EQUAL => __('workflows.operators.greater_than_or_equal'),
            self::LESS_THAN => __('workflows.operators.less_than'),
            self::LESS_THAN_OR_EQUAL => __('workflows.operators.less_than_or_equal'),
            self::CONTAINS => __('workflows.operators.contains'),
            self::NOT_CONTAINS => __('workflows.operators.not_contains'),
            self::IS_NULL => __('workflows.operators.is_null'),
            self::IS_NOT_NULL => __('workflows.operators.is_not_null'),
            self::IS_TRUE => __('workflows.operators.is_true'),
            self::IS_FALSE => __('workflows.operators.is_false'),
            self::CHANGED => __('workflows.operators.changed'),
            self::CHANGED_FROM => __('workflows.operators.changed_from'),
            self::CHANGED_TO => __('workflows.operators.changed_to'),
        };
    }

    /**
     * Check if this operator requires a value parameter.
     */
    public function requiresValue(): bool
    {
        return match ($this) {
            self::IS_NULL,
            self::IS_NOT_NULL,
            self::IS_TRUE,
            self::IS_FALSE,
            self::CHANGED => false,
            default => true,
        };
    }

    /**
     * Get the expected value type for this operator.
     */
    public function valueType(): string
    {
        return match ($this) {
            self::EQUALS,
            self::NOT_EQUALS,
            self::CONTAINS,
            self::NOT_CONTAINS,
            self::CHANGED_FROM,
            self::CHANGED_TO => 'string',
            
            self::GREATER_THAN,
            self::GREATER_THAN_OR_EQUAL,
            self::LESS_THAN,
            self::LESS_THAN_OR_EQUAL => 'number',
            
            default => 'mixed',
        };
    }

    /**
     * Get operators grouped by category.
     */
    public static function grouped(): array
    {
        return [
            'comparison' => [
                self::EQUALS,
                self::NOT_EQUALS,
                self::GREATER_THAN,
                self::GREATER_THAN_OR_EQUAL,
                self::LESS_THAN,
                self::LESS_THAN_OR_EQUAL,
            ],
            'string' => [
                self::CONTAINS,
                self::NOT_CONTAINS,
            ],
            'null' => [
                self::IS_NULL,
                self::IS_NOT_NULL,
            ],
            'boolean' => [
                self::IS_TRUE,
                self::IS_FALSE,
            ],
            'change' => [
                self::CHANGED,
                self::CHANGED_FROM,
                self::CHANGED_TO,
            ],
        ];
    }
} 