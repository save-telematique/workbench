<?php

return [
    'title' => 'Groups',
    'singular' => 'Group',
    'plural' => 'Groups',

    'fields' => [
        'name' => 'Name',
        'description' => 'Description',
        'color' => 'Color',
        'parent' => 'Parent Group',
        'parent_id' => 'Parent Group',
        'is_active' => 'Active',
        'tenant' => 'Tenant',
        'created_at' => 'Created At',
        'updated_at' => 'Updated At',
        'full_path' => 'Full Path',
        'children_count' => 'Child Groups',
        'vehicles_count' => 'Vehicles',
        'drivers_count' => 'Drivers',
        'users_count' => 'Users',
    ],

    'actions' => [
        'create' => 'Create Group',
        'edit' => 'Edit Group',
        'delete' => 'Delete Group',
        'view' => 'View Group',
        'show' => 'Show Group',
        'assign_users' => 'Assign Users',
        'manage_hierarchy' => 'Manage Hierarchy',
    ],

    'messages' => [
        'created' => 'Group created successfully.',
        'updated' => 'Group updated successfully.',
        'deleted' => 'Group deleted successfully.',
        'assigned_users' => 'Users assigned to group successfully.',
        'no_groups' => 'No groups found.',
        'no_parent' => 'Root Group',
    ],

    'validation' => [
        'name_required' => 'Group name is required.',
        'name_max' => 'Group name cannot exceed 255 characters.',
        'description_max' => 'Description cannot exceed 1000 characters.',
        'color_format' => 'Color must be a valid hex color code (e.g., #FF0000).',
        'parent_exists' => 'Selected parent group does not exist.',
        'tenant_required' => 'Tenant is required for all groups.',
        'tenant_exists' => 'Selected tenant does not exist.',
    ],

    'errors' => [
        'has_children' => 'Cannot delete group that has child groups. Please delete or reassign child groups first.',
        'has_vehicles' => 'Cannot delete group that has vehicles assigned. Please reassign vehicles first.',
        'has_drivers' => 'Cannot delete group that has drivers assigned. Please reassign drivers first.',
        'circular_reference' => 'Cannot set parent group as it would create a circular reference.',
        'parent_different_tenant' => 'Parent group must belong to the same tenant.',
        'cannot_change_tenant_with_relations' => 'Cannot change tenant for a group that has child groups, vehicles, or drivers assigned.',
        'not_found' => 'Group not found.',
        'access_denied' => 'You do not have access to this group.',
    ],

    'descriptions' => [
        'hierarchy' => 'Groups can be organized in a hierarchical structure. Users assigned to a parent group automatically have access to all child groups and their resources.',
        'access_control' => 'Users can be assigned to one or more groups to control their access to vehicles and drivers.',
        'color_coding' => 'Assign colors to groups for easy visual identification in the interface.',
    ],

    'placeholders' => [
        'name' => 'Enter group name...',
        'description' => 'Enter group description...',
        'search' => 'Search groups...',
        'tenant' => 'Select a tenant...',
        'parent_group' => 'Select parent group...',
    ],

    'options' => [
        'no_parent' => 'No parent (root group)',
    ],

    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
    ],
]; 