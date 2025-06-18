<?php

return [
    'title' => 'Workflows',
    'description' => 'Automate your business processes with configurable workflows',
    
    'breadcrumbs' => [
        'index' => 'Workflows',
        'create' => 'Create Workflow',
        'edit' => 'Edit Workflow',
        'executions' => 'Executions',
        'analytics' => 'Analytics',
    ],

    'list' => [
        'heading' => 'Workflows',
        'description' => 'Manage and configure automated business processes',
        'no_workflows' => 'No workflows found',
    ],

    'create' => [
        'heading' => 'Create Workflow',
        'description' => 'Create a new automated workflow for your business processes',
    ],

    'edit' => [
        'heading' => 'Edit Workflow :name',
        'description' => 'Modify the workflow configuration and settings',
    ],

    'executions' => [
        'heading' => 'Workflow :name Executions',
        'description' => 'Execution history and workflow performance',
        'no_executions' => 'No executions found for this workflow',
        'fields' => [
            'id' => 'ID',
            'status' => 'Status',
            'started_at' => 'Started at',
            'completed_at' => 'Completed at',
            'duration' => 'Duration',
            'triggered_by' => 'Triggered by',
            'error_message' => 'Error message',
        ],
    ],



    'details' => [
        'title' => 'Workflow Details',
    ],
    
    'fields' => [
        'name' => 'Name',
        'description' => 'Description',
        'status' => 'Status',
        'is_active' => 'Active',
        'components' => 'Components',
        'last_execution' => 'Last Execution',
        'created_at' => 'Created at',
        'updated_at' => 'Updated at',
    ],

    'actions' => [
        'create' => 'Create workflow',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'activate' => 'Activate',
        'deactivate' => 'Deactivate',
        'test' => 'Test',
        'duplicate' => 'Duplicate',
        'view_executions' => 'View executions',
        'log_alert' => 'Log alert',
        'create_alert' => 'Create Alert',
    ],

    'events' => [
        'vehicle_location_updated' => 'Vehicle location updated',
        'vehicle_entered_geofence' => 'Vehicle entered geofence',
        'vehicle_exited_geofence' => 'Vehicle exited geofence',
        'vehicle_speed_exceeded' => 'Vehicle speed limit exceeded',
        'vehicle_ignition_on' => 'Vehicle ignition turned on',
        'vehicle_ignition_off' => 'Vehicle ignition turned off',
        'vehicle_movement_started' => 'Vehicle movement started',
        'vehicle_movement_stopped' => 'Vehicle movement stopped',
        'vehicle_fuel_low' => 'Vehicle fuel low',
        'vehicle_odometer_updated' => 'Vehicle odometer updated',
        'driver_card_inserted' => 'Driver card inserted',
        'driver_card_removed' => 'Driver card removed',
        'driver_activity_changed' => 'Driver activity changed',
        'driver_driving_time_exceeded' => 'Driver driving time exceeded',
        'driver_rest_time_insufficient' => 'Driver rest time insufficient',
        'driver_working_session_started' => 'Driver working session started',
        'driver_working_session_ended' => 'Driver working session ended',
        'device_online' => 'Device online',
        'device_offline' => 'Device offline',
        'device_message_received' => 'Device message received',
        'device_error' => 'Device error',
        'geofence_created' => 'Geofence created',
        'geofence_updated' => 'Geofence updated',
        'geofence_deleted' => 'Geofence deleted',
        'scheduled_time' => 'Scheduled time',
        'daily_report' => 'Daily report',
        'weekly_report' => 'Weekly report',
        'monthly_report' => 'Monthly report',
    ],

    'operators' => [
        'equals' => 'Equals',
        'not_equals' => 'Not equals',
        'greater_than' => 'Greater than',
        'greater_than_or_equal' => 'Greater than or equal',
        'less_than' => 'Less than',
        'less_than_or_equal' => 'Less than or equal',
        'contains' => 'Contains',
        'not_contains' => 'Does not contain',
        'starts_with' => 'Starts with',
        'ends_with' => 'Ends with',
        'regex_match' => 'Matches regex',
        'in' => 'In list',
        'not_in' => 'Not in list',
        'is_empty' => 'Is empty',
        'is_not_empty' => 'Is not empty',
        'is_null' => 'Is null',
        'is_not_null' => 'Is not null',
        'is_true' => 'Is true',
        'is_false' => 'Is false',
        'in_geofence' => 'In geofence',
        'not_in_geofence' => 'Not in geofence',
        'within_distance' => 'Within distance',
        'outside_distance' => 'Outside distance',
        'between_times' => 'Between times',
        'not_between_times' => 'Not between times',
        'older_than' => 'Older than',
        'newer_than' => 'Newer than',
        'changed' => 'Changed',
        'changed_from' => 'Changed from',
        'changed_to' => 'Changed to',
    ],

    'actions_types' => [
        'create_alert' => 'Create alert',
        'update_alert' => 'Update alert',
        'resolve_alert' => 'Resolve alert',
        'send_email' => 'Send email',
        'send_sms' => 'Send SMS',
        'send_push_notification' => 'Send push notification',
        'send_webhook' => 'Send webhook',
        'update_field' => 'Update field',
        'update_status' => 'Update status',
        'add_tag' => 'Add tag',
        'remove_tag' => 'Remove tag',
        'lock_vehicle' => 'Lock vehicle',
        'unlock_vehicle' => 'Unlock vehicle',
        'disable_vehicle' => 'Disable vehicle',
        'enable_vehicle' => 'Enable vehicle',
        'set_speed_limit' => 'Set speed limit',
        'assign_driver' => 'Assign driver',
        'unassign_driver' => 'Unassign driver',
        'send_driver_message' => 'Send driver message',
        'log_event' => 'Log event',
        'create_report' => 'Create report',
        'export_data' => 'Export data',
        'call_api' => 'Call API',
        'send_to_queue' => 'Send to queue',
        'trigger_workflow' => 'Trigger workflow',
        'schedule_action' => 'Schedule action',
        'delay_action' => 'Delay action',
        'repeat_action' => 'Repeat action',
    ],

    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'pending' => 'Pending',
        'running' => 'Running',
        'completed' => 'Completed',
        'failed' => 'Failed',
    ],

    'execution' => [
        'title' => 'Executions',
        'triggered_by' => 'Triggered by',
        'started_at' => 'Started at',
        'completed_at' => 'Completed at',
        'duration' => 'Duration',
        'status' => [
            'title' => 'Status',
            'completed' => 'Completed',
            'failed' => 'Failed',
            'running' => 'Running',
            'pending' => 'Pending',
        ],
        'error_message' => 'Error message',
        'execution_log' => 'Execution log',
        'recent' => 'Recent Executions',
        'recent_description' => 'View the latest workflow executions and their status',
        'never' => 'Never executed',
        'last_execution' => 'Last execution',
    ],

    'sidebar' => [
        'navigation' => 'Navigation',
        'information' => 'Information',
        'executions' => 'Executions',
        'settings' => 'Settings',
    ],

    'statistics' => [
        'total_executions' => 'Total executions',
        'successful_executions' => 'Successful executions',
        'failed_executions' => 'Failed executions',
        'success_rate' => 'Success rate',
        'average_execution_time' => 'Average execution time',
        'last_execution' => 'Last execution',
    ],

    'messages' => [
        'created' => 'Workflow created successfully',
        'updated' => 'Workflow updated successfully',
        'deleted' => 'Workflow deleted successfully',
        'activated' => 'Workflow activated successfully',
        'deactivated' => 'Workflow deactivated successfully',
        'test_started' => 'Workflow test started',
        'test_completed' => 'Workflow test completed',
        'test_failed' => 'Workflow test failed',
        'creation_failed' => 'Failed to create workflow',
        'update_failed' => 'Failed to update workflow',
        'deletion_failed' => 'Failed to delete workflow',
        'toggle_failed' => 'Failed to toggle workflow status',
        'no_workflows' => 'No workflows configured',
        'no_executions' => 'No executions found',
    ],

    'validation' => [
        'name_required' => 'Workflow name is required',
        'name_unique' => 'This workflow name already exists',
        'trigger_required' => 'At least one trigger is required',
        'action_required' => 'At least one action is required',
        'no_triggers' => 'This workflow has no triggers configured',
        'no_actions' => 'This workflow has no actions configured',
        'invalid_condition' => 'Invalid condition',
        'invalid_action_parameters' => 'Invalid action parameters',
        'trigger_event_required' => 'Please select an event type for all triggers.',
    ],

    'sidebar' => [
        'information' => 'Information',
        'executions' => 'Executions',
        'settings' => 'Settings',
        'navigation' => 'Navigation',
    ],

    'components' => [
        'triggers' => 'Triggers',
        'conditions' => 'Conditions',
        'actions' => 'Actions',
    ],

    'builder' => [
        'create_title' => 'Create Workflow',
        'edit_title' => 'Edit Workflow',
        'description' => 'Build powerful automation workflows with triggers, conditions, and actions',
        'basic_info' => 'Basic Information',
        'name_placeholder' => 'Enter workflow name',
        'description_placeholder' => 'Describe what this workflow does',
        'triggers_title' => 'Workflow Triggers',
        'conditions_title' => 'Workflow Conditions',
        'actions_title' => 'Workflow Actions',
        'add_trigger' => 'Add Trigger',
        'add_condition' => 'Add Condition',
        'add_action' => 'Add Action',
        'no_triggers' => 'No triggers configured. Add a trigger to get started.',
        'no_conditions' => 'No conditions configured. Conditions are optional.',
        'no_actions' => 'No actions configured. Add an action to complete the workflow.',
        'triggers_help' => 'Triggers determine when your workflow will be executed.',
        'conditions_help' => 'Conditions filter events before executing actions.',
        'actions_help' => 'Actions define what happens when the workflow is triggered.',
        'workflow_flow' => 'Workflow Flow',
        'flow_description' => 'Build your workflow by defining triggers, conditions, and actions.',
        'last_modified' => 'Last modified',
        'variables' => 'Variables',
        'available_variables' => 'Available Variables',
        'variables_description' => 'Click on a variable to insert it into your conditions or actions.',
        'trigger' => 'Trigger',
        'condition' => 'Condition',
        'action' => 'Action',
        'event_type' => 'Event Type',
        'select_event' => 'Select an event',
        'field' => 'Field',
        'field_placeholder' => 'e.g., vehicle.speed',
        'operator' => 'Operator',
        'value' => 'Value',
        'value_placeholder' => 'Enter value',
        'logical_operator' => 'Logic',
        'action_type' => 'Action Type',
        'select_action' => 'Select an action',
        'action_parameters' => 'Action Parameters',
        'select_option' => 'Select an option',
    ],

    'parameters' => [
        'message' => 'Message',
        'level' => 'Log Level',
        'title' => 'Alert Title',
        'content' => 'Alert Content',

        'severity' => 'Severity Level',
    ],

    'placeholders' => [
        'name' => 'Enter workflow name',
        'description' => 'Describe what this workflow does',
        'log_message' => 'Enter log message content',
        'alert_title' => 'Enter alert title',
        'alert_content' => 'Enter alert content or description',
    ],

    'log_levels' => [
        'debug' => 'Debug',
        'info' => 'Info',
        'warning' => 'Warning',
        'error' => 'Error',
        'critical' => 'Critical',
    ],



    'severity_levels' => [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'critical' => 'Critical',
    ],

    'breadcrumbs' => [
        'index' => 'Workflows',
        'create' => 'Create Workflow',
        'edit' => 'Edit Workflow',
    ],

    'list' => [
        'heading' => 'Workflows',
        'description' => 'Manage and configure automated business processes',
        'no_workflows' => 'No workflows found',
    ],

    'create' => [
        'heading' => 'Create Workflow',
        'description' => 'Create a new automated workflow for your business processes',
    ],

    'edit' => [
        'heading' => 'Edit Workflow :name',
        'description' => 'Modify the workflow configuration and settings',
    ],

    'details' => [
        'title' => 'Workflow Details',
    ],

    'fields' => [
        'name' => 'Name',
        'description' => 'Description',
        'status' => 'Status',
        'is_active' => 'Active',
        'components' => 'Components',
        'last_execution' => 'Last Execution',
        'created_at' => 'Created at',
        'updated_at' => 'Updated at',
    ],

    'actions' => [
        'create' => 'Create workflow',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'activate' => 'Activate',
        'deactivate' => 'Deactivate',
        'test' => 'Test',
        'duplicate' => 'Duplicate',
        'view_executions' => 'View executions',
    ],

    // Common terms
    'workflow' => 'Workflow',
    'workflows' => 'Workflows',
    'event' => 'Event',
    'events' => 'Events',
    'action' => 'Action',
    'actions' => 'Actions',
    'condition' => 'Condition',
    'conditions' => 'Conditions',
    'trigger' => 'Trigger',
    'triggers' => 'Triggers',

    // Categories
    'categories' => [
        'vehicle_location' => 'Vehicle Location',
        'geofences' => 'Geofences',
        'logging' => 'Logging',
        'comparison' => 'Comparison',
        'string' => 'Text',
        'null' => 'Empty Values',
        'boolean' => 'True/False',
        'change' => 'Change Detection',
    ],

    // Variable categories
    'variable_categories' => [
        'device' => 'Device',
        'vehicle' => 'Vehicle',
        'location' => 'Location',
        'time' => 'Time',
    ],

    'visual' => [
        'title' => 'Visual Representation',
        'description' => 'Workflow flow diagram with its triggers, conditions and actions',
        'no_triggers' => 'No triggers configured',
        'no_actions' => 'No actions configured',
        'parameters' => 'parameters',
    ],

    // Event categories
    'event_categories' => [
        'vehicle_location' => 'Vehicle Location',
        'geofences' => 'Geofences',
    ],

    // Operator categories
    'operator_categories' => [
        'comparison' => 'Comparison',
        'string' => 'Text',
        'null' => 'Null Values',
        'boolean' => 'Boolean',
        'change' => 'Change Detection',
    ],

    // Action categories
    'action_categories' => [
        'logging' => 'Logging',
    ],
]; 