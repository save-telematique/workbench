<?php

return [
    'title' => 'Drivers',
    'description' => 'Manage your drivers here',
    
    'breadcrumbs' => [
        'index' => 'Drivers',
        'create' => 'Create Driver',
        'edit' => 'Edit Driver',
    ],
    
    'tabs' => [
        'list' => 'Driver List',
    ],
    
    'sidebar' => [
        'list' => 'All Drivers',
        'information' => 'Driver Information',
        'license' => 'License Details',
        'settings' => 'Settings',
    ],
    
    'list' => [
        'heading' => 'Drivers',
        'description' => 'Manage and view all of your fleet drivers.',
        'no_drivers' => 'No drivers found',
        'get_started' => 'Create your first driver to get started',
    ],
    
    'fields' => [
        'surname' => 'Surname',
        'firstname' => 'First Name',
        'phone' => 'Phone',
        'license_number' => 'License Number',
        'card_issuing_country' => 'License Issuing Country',
        'card_number' => 'Card Number',
        'birthdate' => 'Birth Date',
        'card_issuing_date' => 'Card Issuing Date',
        'card_expiration_date' => 'Card Expiration Date',
        'tenant' => 'Tenant',
        'user' => 'User Account',
    ],
    
    'placeholders' => [
        'tenant' => 'Select a tenant',
        'user' => 'Select a user',
    ],
    
    'filters' => [
        'tenant' => 'Tenant',
    ],
    
    'sections' => [
        'driver_info' => 'Driver Information',
        'license_info' => 'License Information',
        'tenant_info' => 'Tenant Information',
        'user_info' => 'User Account Information',
    ],
    
    'actions' => [
        'create' => 'New Driver',
    ],
    
    'create' => [
        'title' => 'Create Driver',
    ],
    
    'edit' => [
        'title' => 'Edit Driver',
    ],
    
    'delete' => [
        'title' => 'Delete Driver',
        'description' => 'Are you sure you want to delete driver :name? This action cannot be undone.',
    ],
    
    'restore' => [
        'title' => 'Restore Driver',
        'description' => 'Are you sure you want to restore driver :name?',
    ],
]; 