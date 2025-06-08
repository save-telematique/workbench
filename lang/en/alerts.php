<?php

return [
    'title' => 'Alerts',
    'description' => 'Manage system alerts and notifications',
    'create' => 'Create Alert',
    'edit' => 'Edit Alert',
    'show' => 'Alert Details',
    'delete' => 'Delete Alert',
    'restore' => 'Restore Alert',
    
    'list' => [
        'title' => 'Alert List',
        'no_alerts' => 'No alerts found',
        'showing' => 'Showing :from to :to of :total alerts',
    ],
    
    'fields' => [
        'title' => 'Title',
        'content' => 'Content',
        'severity' => 'Severity',
        'status' => 'Status',
        'entity' => 'Entity',
        'related_entity' => 'Related Entity',
        'is_read' => 'Read',
        'is_active' => 'Active',
        'created_by' => 'Created by',
        'expires_at' => 'Expires at',
        'metadata' => 'Metadata',
        'type' => 'Type',
    ],
    
    'actions' => [
        'create' => 'Create Alert',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'restore' => 'Restore',
        'mark_as_read' => 'Mark as Read',
        'mark_as_unread' => 'Mark as Unread',
        'mark_all_read' => 'Mark All Read',
        'back_to_list' => 'Back to List',
        'view_all' => 'View All Alerts',
    ],
    
    'severity' => [
        'info' => 'Info',
        'warning' => 'Warning',
        'error' => 'Error',
        'success' => 'Success',
    ],
    
    'status' => [
        'read' => 'Read',
        'unread' => 'Unread',
    ],
    
    'show' => [
        'content_title' => 'Alert Content',
        'details_title' => 'Alert Details',
    ],
    
    'metadata' => [
        'links' => 'Links',
        'image' => 'Image',
    ],
    
    'breadcrumbs' => [
        'index' => 'Alerts',
        'create' => 'New Alert',
        'edit' => 'Edit',
        'show' => 'Details',
    ],
    
    'confirmations' => [
        'delete' => 'Are you sure you want to delete this alert?',
        'restore' => 'Are you sure you want to restore this alert?',
    ],
    
    'messages' => [
        'created' => 'Alert created successfully.',
        'updated' => 'Alert updated successfully.',
        'deleted' => 'Alert deleted successfully.',
        'restored' => 'Alert restored successfully.',
        'marked_as_read' => 'Alert marked as read.',
        'marked_as_unread' => 'Alert marked as unread.',
    ],
    
    'validation' => [
        'title' => [
            'required' => 'The title field is required.',
            'max' => 'The title may not be greater than :max characters.',
        ],
        'content' => [
            'required' => 'The content field is required.',
        ],
        'type' => [
            'required' => 'The type field is required.',
        ],
        'severity' => [
            'required' => 'The severity field is required.',
            'in' => 'The selected severity is invalid.',
        ],
        'alertable_type' => [
            'required' => 'The entity type field is required.',
        ],
        'alertable_id' => [
            'required' => 'The entity ID field is required.',
        ],
        'expires_at' => [
            'after' => 'The expiration date must be in the future.',
        ],
    ],
    
    'entity' => [
        'title' => 'Entity Alerts',
        'no_alerts' => 'No alerts found for this entity',
        'no_filtered_alerts' => 'No alerts found for the selected filters',
        'no_alerts_description' => 'This :entity has no alerts at the moment.',
        'try_different_filters' => 'Try adjusting your filters to see more results.',
    ],
    
    'filters' => [
        'all' => 'All',
        'read' => 'Read',
        'unread' => 'Unread',
        'all_severities' => 'All Severities',
    ],
    
    'types' => [
        'system' => 'System',
        'maintenance' => 'Maintenance',
        'security' => 'Security',
        'performance' => 'Performance',
        'user' => 'User',
        'device' => 'Device',
        'vehicle' => 'Vehicle',
        'driver' => 'Driver',
    ],
    
    'unread_count' => ':count unread alert(s)',
    'search_placeholder' => 'Search in alerts...',
    'complex_content' => 'Complex content',
    'no_results' => 'No alerts found.',
    'loading' => 'Loading alerts...',
    'empty_state' => [
        'title' => 'No Alerts',
        'description' => 'There are no alerts to display yet.',
    ],
    
    'sidebar' => [
        'details' => 'Details',
        'all_alerts' => 'All Alerts',
        'navigation' => 'Navigation',
    ],
]; 