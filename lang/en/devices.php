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
        'updated' => 'Device updated successfully.',
        'title' => 'Device Messages',
        'description' => 'View and manage device messages and location data',
        'select_date' => 'Select date',
        'no_messages_title' => 'No messages found',
        'no_messages' => 'This device has not sent any messages yet.',
        'no_messages_for_date' => 'No messages found for :date.',
        'message_count' => 'messages',
        'message_total' => ':total messages total',
        'message_data' => 'Message Data',
        'raw_data' => 'Raw Data',
        'location' => 'Location',
        'processed' => 'Processed',
        'not_processed' => 'Not Processed',
        'ip' => 'IP',
        'coordinates' => 'Coordinates',
        'speed' => 'Speed',
        'heading' => 'Heading',
        'speed_heading' => 'Speed & Heading',
        'status' => 'Status',
        'moving' => 'Movement Status',
        'moving_state' => 'Moving',
        'ignition' => 'Ignition Status',
        'ignition_on' => 'ON',
        'ignition_off' => 'OFF',
        'stationary' => 'Stationary',
        'address' => 'Address',
        'recorded_at' => 'Recorded at',
        'view_on_map' => 'View on map',
        'no_data' => 'No message data available',
        'processing_info' => 'Processing Info',
        'processed_at' => 'Processed at',
        'received_at' => 'Received at',
        'processing_time' => 'Processing time',
        'seconds' => 'seconds',
        'status_processed' => 'Processed',
        'status_pending' => 'Pending processing',
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
]; 