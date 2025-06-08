<?php

namespace App\Enum;

enum WorkflowActionType: string
{
    // Logging action
    case LOG_ALERT = 'log_alert';
    
    // Alert management
    case CREATE_ALERT = 'create_alert';

    /**
     * Get human-readable label for the action type.
     */
    public function label(): string
    {
        return match ($this) {
            self::LOG_ALERT => __('workflows.actions.log_alert'),
            self::CREATE_ALERT => __('workflows.actions.create_alert'),
        };
    }

    /**
     * Get the target models that this action can work with.
     */
    public function applicableModels(): array
    {
        return match ($this) {
            self::LOG_ALERT => ['*'], // Universal action
            self::CREATE_ALERT => ['*'], // Universal action
        };
    }

    /**
     * Get required parameters for this action type.
     */
    public function requiredParameters(): array
    {
        return match ($this) {
            self::LOG_ALERT => ['message', 'level'],
            self::CREATE_ALERT => ['title', 'content', 'severity'],
        };
    }

    /**
     * Get actions grouped by category.
     */
    public static function grouped(): array
    {
        return [
            'logging' => [
                self::LOG_ALERT,
            ],
            'alerts' => [
                self::CREATE_ALERT,
            ],
        ];
    }
} 