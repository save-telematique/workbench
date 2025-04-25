<?php

return [
    'title' => 'Vehicles',
    'breadcrumbs' => [
        'index' => 'Vehicles',
        'create' => 'Add Vehicle',
        'edit' => 'Edit Vehicle',
        'show' => 'Vehicle Details',
    ],
    'fields' => [
        'registration' => 'Registration',
        'brand' => 'Brand',
        'model' => 'Model',
        'color' => 'Color',
        'year' => 'Year',
        'vin' => 'VIN',
        'tenant' => 'Tenant',
        'device' => 'Device',
    ],
    'actions' => [
        'create' => 'Add Vehicle',
        'edit' => 'Edit',
        'view' => 'View',
        'delete' => 'Delete',
        'restore' => 'Restore',
    ],
    'placeholders' => [
        'registration' => 'Enter vehicle registration',
        'brand' => 'Select vehicle brand',
        'model' => 'Enter vehicle model',
        'color' => 'Enter vehicle color',
        'year' => 'Enter vehicle year',
        'vin' => 'Enter vehicle identification number',
        'tenant' => 'Select tenant',
        'device' => 'Select device',
        'has_device' => 'Filter by device status',
    ],
    'create' => [
        'heading' => 'Add New Vehicle',
        'description' => 'Create a new vehicle in the system',
        'card' => [
            'title' => 'Vehicle Information',
            'description' => 'Enter details about the vehicle',
        ],
        'success_message' => 'Vehicle added successfully',
        'submit_button' => 'Create Vehicle',
    ],
    'edit' => [
        'heading' => 'Edit Vehicle',
        'description' => 'Update vehicle information',
        'card' => [
            'title' => 'Vehicle Information',
            'description' => 'Update details about the vehicle',
        ],
        'success_message' => 'Vehicle updated successfully',
        'submit_button' => 'Update Vehicle',
    ],
    'show' => [
        'title' => 'Vehicle: :registration',
        'heading' => 'Vehicle Details',
        'description' => 'View complete information about this vehicle',
        'sections' => [
            'details' => [
                'title' => 'Vehicle Details',
                'description' => 'Basic information about the vehicle',
            ],
            'associations' => [
                'title' => 'Associations',
                'description' => 'Related tenant and device information',
            ],
            'metadata' => [
                'title' => 'Metadata',
                'description' => 'System information about this record',
            ],
        ],
    ],
    'confirmations' => [
        'delete' => 'Are you sure you want to delete this vehicle?',
        'delete_title' => 'Delete Vehicle',
        'delete_description' => 'This action will remove the vehicle from active use. You can restore it later if needed.',
        'restore' => 'Are you sure you want to restore this vehicle?',
    ],
    'filters' => [
        'tenant' => 'Filter by Tenant',
        'brand' => 'Filter by Brand',
        'has_device' => 'Has Device',
    ],
    'sidebar' => [
        'information' => 'Vehicles',
        'settings' => 'Settings',
    ],
]; 