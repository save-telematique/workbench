<?php

return [
    // General
    'title' => 'Devices',
    'single' => 'Device',
    'description' => 'Manage all telematics devices in the system',
    
    // Fields
    'fields' => [
        'id' => 'ID',
        'tenant' => 'Tenant',
        'device_type' => 'Device Type',
        'vehicle' => 'Vehicle',
        'firmware_version' => 'Firmware Version',
        'serial_number' => 'Serial Number',
        'sim_number' => 'SIM Number',
        'imei' => 'IMEI',
        'created_at' => 'Created At',
        'updated_at' => 'Updated At',
        'deleted_at' => 'Deleted At',
        'name' => 'Name',
        'type' => 'Type',
        'owner' => 'Owner',
        'status' => 'Status',
        'last_contact' => 'Last Contact',
    ],
    
    // Actions
    'actions' => [
        'create' => 'Add Device',
        'edit' => 'Edit Device',
        'delete' => 'Delete Device',
        'restore' => 'Restore Device',
        'force_delete' => 'Permanently Delete',
        'view' => 'View Device',
        'assign_vehicle' => 'Assign to Vehicle',
        'unassign_vehicle' => 'Unassign from Vehicle',
        'unassign_vehicle_short' => 'Unassign',
        'back_to_list' => 'Back to list',
        'save' => 'Save Device',
        'cancel' => 'Cancel',
        'back' => 'Back to Devices',
        'view_messages' => 'View Messages',
    ],
    
    // Messages
    'created' => 'Device created successfully.',
    'updated' => 'Device updated successfully.',
    'deleted' => 'Device deleted successfully.',
    'restored' => 'Device restored successfully.',
    'force_deleted' => 'Device permanently deleted.',
    'vehicle_assigned' => 'Device assigned to vehicle successfully.',
    'vehicle_unassigned' => 'Device unassigned from vehicle successfully.',
    'confirm_delete' => 'Are you sure you want to delete this device?',
    'confirm_restore' => 'Are you sure you want to restore this device?',
    'confirm_force_delete' => 'Are you sure you want to permanently delete this device? This action cannot be undone.',
    'messages' => [
        'title' => 'Device Messages',
        'description' => 'View messages received from this device',
        'message_count' => '{count} message|{count} messages',
        'no_messages' => 'No messages found for this device',
        'no_messages_title' => 'No messages available',
        'no_messages_for_date' => 'No messages found for :date',
        'processed' => 'Processed',
        'not_processed' => 'Not processed',
        'message_data' => 'Message Data',
        'location' => 'Location',
        'processing_info' => 'Processing Info',
        'coordinates' => 'Coordinates',
        'speed' => 'Speed',
        'heading' => 'Heading',
        'ignition' => 'Ignition',
        'ignition_on' => 'On',
        'ignition_off' => 'Off',
        'moving' => 'Movement',
        'moving_state' => 'Moving',
        'stationary' => 'Stationary',
        'address' => 'Address',
        'recorded_at' => 'Recorded at',
        'received_at' => 'Received at',
        'processed_at' => 'Processed at',
        'processing_time' => 'Processing time',
        'seconds' => 'seconds',
        'ip' => 'IP Address',
        'status' => 'Status',
        'status_processed' => 'Processed',
        'status_pending' => 'Pending',
        'no_data' => 'No data available',
        'view_on_map' => 'View on map',
        'vehicle_locations' => 'Vehicle Locations',
        'vehicle_location_map' => 'Vehicle Location Map',
        'locations' => 'locations',
        'no_location_data' => 'No location data',
        'no_locations_available' => 'No location information is available for this date',
        'path_trace' => 'Vehicle path',
        'currently_moving' => 'Currently Moving',
        'active' => 'Active',
        'sync' => [
            'started' => 'Starting device messages synchronization...',
            'last_timestamp' => 'Last message timestamp: :timestamp',
            'no_messages' => 'No existing messages found. Using default timestamp: :timestamp',
            'api_failed' => 'API call failed with status code: :status',
            'no_new_messages' => 'No new messages found.',
            'found_messages' => 'Found :count new messages to sync.',
            'success' => 'Successfully synchronized :count device messages.',
            'error' => 'An error occurred: :message',
        ],
    ],
    
    // Map-related translations
    'map' => [
        'show_all_points' => 'Show all points',
        'hide_all_points' => 'Hide all points',
        'reset_view' => 'Reset view',
        'fullscreen' => 'Fullscreen',
        'exit_fullscreen' => 'Exit fullscreen',
        'heading' => 'Heading',
        'first_point' => 'First point',
        'last_point' => 'Last point',
        'km_per_hour' => 'km/h',
        'jump_to_start' => 'Jump to start',
        'jump_to_end' => 'Jump to end',
        'play' => 'Play',
        'pause' => 'Pause',
        'playback_speed' => 'Playback speed',
    ],
    
    // Confirmations for actions
    'confirmations' => [
        'delete' => 'Are you sure you want to delete this device?',
        'restore' => 'Are you sure you want to restore this device?',
    ],
    
    // Breadcrumbs
    'breadcrumbs' => [
        'index' => 'Devices',
        'create' => 'Add Device',
        'edit' => 'Edit Device',
        'show' => 'Device Details',
    ],
    
    // Tabs
    'tabs' => [
        'information' => 'Information',
        'history' => 'History',
        'maintenance' => 'Maintenance',
        'messages' => 'Messages',
    ],
    
    // Filters
    'filters' => [
        'tenant' => 'Tenant',
        'device_type' => 'Device Type',
        'vehicle' => 'Vehicle',
        'deleted' => 'Deletion Status',
        'all' => 'All Devices',
        'active' => 'Active Devices',
        'inactive' => 'Inactive Devices',
        'assigned' => 'Assigned Devices',
        'unassigned' => 'Unassigned Devices',
    ],
    
    // Placeholders
    'placeholders' => [
        'serial_number' => 'Enter device serial number',
        'sim_number' => 'Enter SIM card number',
        'imei' => 'Enter IMEI number',
        'firmware_version' => 'Enter firmware version',
        'device_type' => 'Select device type',
        'vehicle' => 'Select vehicle',
        'tenant' => 'Select tenant',
        'name' => 'Enter device name',
        'type' => 'Select device type',
    ],
    
    // List related translations
    'list' => [
        'heading' => 'Devices',
        'description' => 'Manage all telematics devices in the system',
        'no_devices' => 'No devices found',
        'get_started' => 'Start by adding your first device',
    ],
    
    // Create related translations
    'create' => [
        'heading' => 'Add Device',
        'description' => 'Create a new telematics device in the system',
        'card' => [
            'title' => 'Device Information',
            'description' => 'Please fill in the information to create a new device',
        ],
        'success_message' => 'Device created successfully',
        'submit_button' => 'Create Device',
    ],
    
    // Edit related translations
    'edit' => [
        'heading' => 'Edit Device :serial',
        'description' => 'Modify device information',
        'form_title' => 'Edit Device Details',
        'form_description' => 'Update information for device :serial',
    ],
    
    // Show related translations
    'show' => [
        'heading' => 'Device Details',
        'description' => 'View and manage device information',
        'info_section_title' => 'Device Information',
        'connections_title' => 'Connections',
    ],
    
    'input_methods' => [
        'manual' => 'Manual Entry',
        'scan' => 'Scan QR Code',
    ],
    
    'scan' => [
        'upload_title' => 'Upload a file',
        'upload_description' => 'Take a photo of the device or upload a PDF showing the QR codes to automatically extract the serial number and IMEI',
        'select_image' => 'Select a file',
        'change_image' => 'Change file',
        'scanning' => 'Scanning...',
        'scanning_hint' => 'This may take a moment. We are analyzing QR codes and other visible information on the device.',
        'success' => 'QR codes successfully detected. IMEI and serial number fields have been pre-filled.',
        'error' => 'Unable to detect QR codes. Please try again or enter the information manually.',
        'error_invalid_format' => 'Invalid file format. Accepted formats: JPG, PNG, WebP, and PDF.',
        'error_file_too_large' => 'File too large. Maximum size is 10MB.',
        'error_reading_file' => 'Error reading file. Please try again with another file.',
        'error_cancelled' => 'Scanning cancelled. Please try again.',
        'error_no_image' => 'No file was provided. Please select an image or PDF to analyze.',
        'error_empty_image' => 'The provided file is empty or corrupted. Please try again with another file.',
        'error_no_data_extracted' => 'No information could be extracted from the file. Please ensure QR codes are clearly visible or enter the information manually.',
        'error_converting_pdf' => 'Failed to convert PDF to image for analysis. Please try again with a different file.',
        'continue_to_form' => 'Continue to form',
        'continue_tooltip' => 'Proceed to the form to complete the missing information',
        'device_qr_code' => 'Device QR Code',
    ],
    
    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'maintenance' => 'Maintenance',
    ],
    
    'notifications' => [
        'created' => 'Device created successfully',
        'updated' => 'Device updated successfully',
        'deleted' => 'Device deleted successfully',
    ],
    
    'search' => [
        'placeholder' => 'Search by name, serial number, or IMEI',
    ],
    
    'empty' => [
        'title' => 'No devices found',
        'description' => 'Start by adding your first device',
    ],
]; 