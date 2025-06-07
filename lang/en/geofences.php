<?php

return [
    'title' => 'Geofences',
    'singular' => 'Geofence',
    'plural' => 'Geofences',

    'breadcrumbs' => [
        'index' => 'Geofences',
        'create' => 'Create Geofence',
        'edit' => 'Edit Geofence',
        'show' => 'Geofence Details',
    ],

    'fields' => [
        'name' => 'Name',
        'geojson' => 'Geographic Area',
        'is_active' => 'Active',
        'tenant' => 'Tenant',
        'group' => 'Group',
        'created_at' => 'Created At',
        'updated_at' => 'Updated At',
    ],

    'actions' => [
        'create' => 'Create Geofence',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'view' => 'View',
        'save' => 'Save',
        'cancel' => 'Cancel',
        'back' => 'Back to Geofences',
    ],

    'filters' => [
        'all_tenants' => 'All Tenants',
        'all_groups' => 'All Groups',
        'all_status' => 'All Status',
        'active' => 'Active',
        'inactive' => 'Inactive',
        'search_placeholder' => 'Search geofences...',
    ],

    'messages' => [
        'created' => 'Geofence created successfully.',
        'updated' => 'Geofence updated successfully.',
        'deleted' => 'Geofence deleted successfully.',
        'not_found' => 'Geofence not found.',
    ],

    'validation' => [
        'name_required' => 'The geofence name is required.',
        'geojson_required' => 'The geographic area is required.',
        'geojson_type_invalid' => 'The geographic area must be a valid Polygon or MultiPolygon.',
    ],

    'descriptions' => [
        'index' => 'Manage geographic boundaries and zones for your fleet.',
        'create' => 'Create a new geofence by defining a geographic area.',
        'edit' => 'Modify the geofence settings and boundaries.',
    ],

    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
    ],

    'empty_state' => [
        'title' => 'No geofences found',
        'description' => 'Get started by creating your first geofence.',
        'action' => 'Create Geofence',
    ],

    'list' => [
        'heading' => 'Geofences',
        'description' => 'Manage geographic boundaries and zones for monitoring vehicle locations.',
        'no_geofences' => 'No geofences found.',
    ],

    'sidebar' => [
        'information' => 'Information',
        'map' => 'Map',
    ],

    'map' => [
        'title' => 'Geofences Map',
        'geofences' => 'geofences',
        'geofences_on_map' => 'geofences on map',
        'no_geofences' => 'No geofences available',
        'no_geofences_description' => 'Create your first geofence to see it on the map.',
        'no_data' => 'No geographic data available',
        'draw_polygon' => 'Draw polygon',
        'edit_polygon' => 'Edit polygon',
        'clear_all' => 'Clear all',
        'show_existing' => 'Show existing geofences',
        'hide_existing' => 'Hide existing geofences',
        'reset_view' => 'Reset view',
        'fullscreen' => 'Fullscreen',
        'exit_fullscreen' => 'Exit fullscreen',
        'drawing_mode' => 'Drawing mode',
        'editing_mode' => 'Editing mode',
        'click_polygon_to_start' => 'Click on the polygon tool to start drawing',
        'geofences' => 'geofences',
    ],

    'show' => [
        'information' => 'Information',
        'map' => 'Map View',
        'map_placeholder' => 'Map integration coming soon',
        'map_description' => 'Interactive map view will be available in a future update.',
    ],

    'create' => [
        'title' => 'Create Geofence',
        'heading' => 'Create New Geofence',
        'description' => 'Define a new geographic boundary for your fleet.',
    ],

    'edit' => [
        'title' => 'Edit Geofence',
        'heading' => 'Edit Geofence: :name',
        'description' => 'Modify the geographic boundary settings.',
    ],

    'confirmations' => [
        'delete_title' => 'Delete Geofence',
        'delete_description' => 'Are you sure you want to delete this geofence? This action can be undone.',
    ],

    'form' => [
        'basic_information' => 'Basic Information',
        'tenant_assignment' => 'Tenant Assignment',
        'map_drawing' => 'Map Drawing',
        'map_description' => 'Use the drawing tools to define the geographic area of the geofence.',
    ],

    'placeholders' => [
        'name' => 'Enter geofence name...',
        'group' => 'Select a group...',
        'tenant' => 'Select a tenant...',
        'status' => 'Select a status...',
    ],

    'unnamed' => 'Unnamed geofence',
]; 