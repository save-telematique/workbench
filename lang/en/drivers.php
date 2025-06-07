<?php

return [
    'title' => 'Drivers',
    'singular' => 'Driver',
    'placeholder' => 'Select a driver',
    
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
        'id' => 'ID',
        'surname' => 'Last Name',
        'firstname' => 'First Name',
        'license_number' => 'License Number',
        'card_number' => 'Driver Card Number',
        'card_issuing_country' => 'Card Issuing Country',
        'card_issuing_date' => 'Card Issuing Date',
        'card_expiration_date' => 'Card Expiration Date',
        'birthdate' => 'Date of Birth',
        'phone' => 'Phone Number',
        'user' => 'Associated User',
        'tenant' => 'Tenant',
        'group' => 'Group',
        'created_at' => 'Created At',
        'updated_at' => 'Updated At',
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
        'group' => 'Select a group (optional)',
    ],
    
    'filters' => [
        'tenant' => 'Tenant',
    ],
    
    'sections' => [
        'driver_info' => 'Driver Information',
        'driver_info_description' => 'Personal details of the driver',
        'license_info' => 'License Information',
        'license_info_description' => 'Details about the driver\'s license and card',
        'assignment' => 'Assignment',
        'assignment_description' => 'Assign this driver to a tenant and user account',
        'group_assignment' => 'Group Assignment',
        'group_assignment_description' => 'Optionally assign this driver to a group for organization',
        'tenant_info' => 'Tenant Information',
        'tenant_info_description' => 'Assign this driver to a tenant',
        'user_info' => 'User Account Information',
    ],
    
    'actions' => [
        'create' => 'Create Driver',
        'edit' => 'Edit Driver',
        'delete' => 'Delete Driver',
        'restore' => 'Restore Driver',
        'scan_document' => 'Scan Document',
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
        'title' => 'Scan Driver Document',
        'instruction' => 'Upload a photo of the driver license or card to extract information',
        'error' => 'An error occurred while scanning the document.',
        'error_no_image' => 'Please upload an image file.',
        'error_invalid_format' => 'The file must be an image or PDF (JPEG, PNG, JPG, WEBP, PDF).',
        'error_file_too_large' => 'The file size must not exceed 10MB.',
        'error_no_type' => 'Please specify document type.',
        'error_invalid_type' => 'Invalid document type. Allowed types: license, card.',
        'scanning' => 'Scanning document...',
        'scan_success' => 'Document scanned successfully.',
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
    
    // Import
    'import' => [
        'title' => 'Import Drivers',
        'description' => 'Import drivers from a CSV or Excel file.',
        'upload_tab' => 'Upload',
        'review_tab' => 'Review & Import',
        'upload_title' => 'Upload a file',
        'upload_description' => 'Select a CSV or Excel file containing the driver data to import.',
        'file_type_description' => 'Accepted formats: CSV, Excel (.xlsx, .xls)',
        'select_file' => 'Select file',
        'analyzing' => 'Analyzing file...',
        'analyzing_hint' => 'We\'re using AI to automatically detect columns in your file.',
        'analysis_success' => '{count} drivers have been detected in your file.',
        'tenant_hint' => 'If no tenant is selected, drivers will be imported without an assigned tenant.',
        'success_message' => '{count} drivers have been successfully imported.',
        'error' => 'An error occurred during import.',
        'tenant_required' => 'You must select a tenant to import drivers.',
        'select_tenant_title' => 'Select a Tenant',
        'select_tenant_desc' => 'Select the tenant for which you want to import drivers.',
        'confirm_title' => 'Confirm Driver Import',
        'confirm_description' => 'You are about to import :count drivers. This action cannot be undone. Do you want to continue?',
    ],
    
    'messages' => [
        'created_successfully' => 'Driver created successfully.',
        'updated_successfully' => 'Driver updated successfully.',
        'deleted_successfully' => 'Driver deleted successfully.',
        'restored_successfully' => 'Driver restored successfully.',
    ],
]; 