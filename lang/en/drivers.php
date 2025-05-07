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
        'surname' => 'Enter surname',
        'firstname' => 'Enter first name',
        'phone' => 'Enter phone number',
        'license_number' => 'Enter license number',
        'card_issuing_country' => 'Enter issuing country',
        'card_number' => 'Enter card number',
        'tenant' => 'Select a tenant',
        'user' => 'Select a user',
    ],
    
    'filters' => [
        'tenant' => 'Tenant',
    ],
    
    'sections' => [
        'driver_info' => 'Driver Information',
        'driver_info_description' => 'Personal details of the driver',
        'license_info' => 'License Information',
        'license_info_description' => 'Details about the driver\'s license and card',
        'tenant_info' => 'Tenant Information',
        'tenant_info_description' => 'Assign this driver to a tenant',
        'user_info' => 'User Account Information',
    ],
    
    'actions' => [
        'create' => 'New Driver',
    ],
    
    'create' => [
        'title' => 'Create Driver',
        'heading' => 'Add New Driver',
        'description' => 'Create a new driver record in the system',
        'card' => [
            'title' => 'Driver Details',
            'description' => 'Enter the driver\'s information'
        ],
        'success_message' => 'Driver created successfully!',
        'submit_button' => 'Create Driver',
    ],
    
    'edit' => [
        'title' => 'Edit Driver',
        'heading' => 'Edit Driver',
        'description' => 'Update the details of this driver',
        'form_title' => 'Edit Driver Details',
        'form_description' => 'Update information for :name',
    ],
    
    'delete' => [
        'title' => 'Delete Driver',
        'description' => 'Are you sure you want to delete driver :name? This action cannot be undone.',
    ],
    
    'restore' => [
        'title' => 'Restore Driver',
        'description' => 'Are you sure you want to restore driver :name?',
    ],
    
    'input_methods' => [
        'manual' => 'Manual Entry',
        'scan' => 'Scan Document',
    ],
    
    'scan' => [
        'upload_title' => 'Upload License Document',
        'upload_description' => 'Upload a driver\'s license or driver card to automatically extract information',
        'select_image' => 'Select Image',
        'change_image' => 'Change Image',
        'scanning' => 'Analyzing document...',
        'scanning_hint' => 'We\'re looking for name, license number, and dates',
        'success' => 'Document analyzed successfully! Information has been applied to the form.',
        'driver_license_document' => 'Driver\'s license document',
        'error' => 'Failed to analyze the document',
        'error_no_image' => 'Please select an image to upload',
        'error_invalid_format' => 'Invalid file format. Please upload JPG, PNG, or PDF',
        'error_file_too_large' => 'File is too large. Maximum size is 10MB',
        'error_reading_file' => 'Could not read the uploaded file',
        'error_no_data_extracted' => 'No driver information could be extracted from this document',
    ],
    
    'user_central' => 'Central User',
    'no_users_for_tenant' => 'No users are available for this tenant',
    
    'card' => [
        'title' => 'DRIVER CARD',
        'surname' => '1. Surname',
        'firstname' => '2. First name',
        'birthdate' => '3. Date of birth',
        'issuing_date' => '4a. Issue date',
        'expiration_date' => '4b. Expiry date',
        'license_number' => '5a. License number',
        'card_number' => '5b. Card number',
    ],
]; 