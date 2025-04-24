<?php

return [
    // Tenants list
    'list' => [
        'title' => 'Tenants',
        'breadcrumb' => 'Tenants',
        'heading' => 'Tenants list',
        'description' => 'View and manage your tenants',
        'add_tenant' => 'Add tenant',
        'no_tenants' => 'No tenants',
        'get_started' => 'Get started by creating a new tenant.',
        'create_tenant' => 'Create tenant',
    ],

    // Tenant fields
    'fields' => [
        'name' => 'Name',
        'name_placeholder' => 'Company name',
        'email' => 'Email',
        'email_placeholder' => 'contact@example.com',
        'phone' => 'Phone',
        'phone_placeholder' => '+1 (555) 000-0000',
        'address' => 'Address',
        'address_placeholder' => '123 Main St, City, Country',
        'status_label' => 'Status',
        'logo' => 'Logo',
        'domains' => 'Domains',
    ],

    // Create page
    'create' => [
        'title' => 'Create Tenant',
        'breadcrumb' => 'Create',
        'heading' => 'Create Tenant',
        'description' => 'Add a new tenant to your organization',
        'form_title' => 'Create new tenant',
        'form_description' => 'Complete the form below to create a new tenant',
    ],

    // Edit page
    'edit' => [
        'title' => 'Edit Tenant',
        'breadcrumb' => 'Edit: :name',
        'heading' => 'Edit Tenant',
        'description' => 'Modify tenant information',
        'form_title' => 'Edit tenant information',
        'form_description' => 'Update the details for :name',
    ],

    // Show page
    'show' => [
        'title' => 'Tenant Details',
        'breadcrumb' => 'Details: :name',
        'heading' => 'Tenant Information',
        'description' => 'View and manage tenant details',
        'info_section_title' => 'Information',
    ],

    // Tabs (for show page sidebar)
    'tabs' => [
        'information' => 'Information',
        'domains' => 'Domains',
    ],

    // Domains Management
    'domains' => [
        'breadcrumb' => 'Domains',
        'title' => 'Tenant Domains: :name',
        'heading' => 'Tenant Domains',
        'description' => 'Manage domains for this tenant',
        'add_domain_title' => 'Add New Domain',
        'domain_name_label' => 'Domain Name',
        'domain_name_placeholder' => 'example.com or subdomain',
        'domain_format_tooltip_trigger' => 'Domain format',
        'domain_format_tooltip_content' => 'Use a full domain with a dot (example.com) or just a subdomain name (demo).<br /><br />Full domains are saved as-is, while subdomains will be used as <code>[subdomain].:hostname</code> in your application.',
        'subdomain_preview' => 'Your subdomain will be used as: <span class="font-semibold">:preview</span>',
        'add_domain_button' => 'Add Domain',
        'existing_domains_title' => 'Existing Domains',
        'no_domains' => 'No domains',
        'get_started' => 'Get started by adding a domain above.',
        'table_header_domain' => 'Domain',
        'table_header_type' => 'Type',
        'subdomain_usage_note' => 'Will be used as: <span class="font-medium">:domain</span>',
        'type_full' => 'Full domain',
        'type_subdomain' => 'Subdomain',
        'actions' => [
            'open' => 'Open',
            'open_tooltip' => 'Open in new tab',
            'delete_confirm' => 'Are you sure you want to delete this domain?',
            'delete_tooltip' => 'Delete domain',
        ],
        'messages' => [
            'added' => 'Domain added successfully.',
            'deleted' => 'Domain deleted successfully.',
        ],
    ],

    // Actions
    'actions' => [
        'create' => 'Create tenant',
        'back_to_list' => 'Back to list',
        'back_to_tenant' => 'Back to tenant',
    ],

    // Messages
    'messages' => [
        'created' => 'Tenant created successfully',
        'updated' => 'Tenant updated successfully',
        'deleted' => 'Tenant deleted successfully',
    ],
]; 