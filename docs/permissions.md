# Permissions in Save Workbench

This document outlines how permissions are implemented throughout Save Workbench using Spatie Laravel Permission package, Laravel Policies, and frontend permission checks.

## Overview

Save Workbench uses:

1. **Spatie Laravel Permission**: For storing and checking permissions and roles
2. **Laravel Policies**: For authorization logic and tenant isolation
3. **Frontend Permission Hooks**: For conditionally rendering UI elements

## Permission Structure

### Actions

Permissions follow a consistent naming convention: `action_resource` with these standard actions:

- `view_*`: Ability to view/list resources
- `create_*`: Ability to create new resources
- `edit_*`: Ability to modify existing resources
- `delete_*`: Ability to delete resources

### Resources

Each model has a corresponding set of permissions:

- `users`: Central application users
- `tenants`: Client organizations
- `tenant_users`: Users within a tenant
- `tenant_domains`: Custom domains for tenants
- `vehicles`: Vehicles in the system
- `vehicle_brands`: Vehicle manufacturer brands
- `vehicle_models`: Vehicle models by brand
- `vehicle_types`: Types of vehicles
- `devices`: Telematics devices
- `device_types`: Types of telematic devices
- `drivers`: Vehicle operators
- `global_settings`: Application-wide settings

## Role Structure

### Central Roles

- **super_admin**: Full system access with no restrictions
- **central_admin**: Administrative access to most functionality except critical operations
- **central_user**: Limited view-only access to central application

### Tenant Roles

- **tenant_admin**: Full access to all tenant-specific resources
- **tenant_manager**: Can manage most tenant resources but with some restrictions
- **tenant_user**: Standard user with limited editing capabilities
- **tenant_viewer**: View-only access to tenant resources

## Backend Implementation

### BasePolicy

All policies extend `App\Policies\BasePolicy` which provides standard permission checks:

```php
public function viewAny(User $user): bool
{
    return $user->hasPermissionTo("view_{$this->permissionPrefix}");
}

public function view(User $user, Model $model): bool
{
    return $user->hasPermissionTo("view_{$this->permissionPrefix}");
}

// ...etc
```

### Tenant-Aware Policies

Resource policies for tenant-scoped models include tenant isolation logic:

```php
public function view(User $user, Model $model): bool
{
    // For tenant users, ensure they can only view resources within their tenant
    if ($user->tenant_id && $model->tenant_id !== $user->tenant_id) {
        return false;
    }
    
    return parent::view($user, $model);
}
```

### Controller Authorization

Resource controllers use `authorizeResource` in the constructor:

```php
public function __construct()
{
    $this->authorizeResource(Vehicle::class, 'vehicle');
}
```

Non-resource actions use explicit authorization:

```php
public function restore($id)
{
    $vehicle = Vehicle::withTrashed()->findOrFail($id);
    $this->authorize('restore', $vehicle);
    
    // Restore logic...
}
```

### Gate Super Admin Override

Super admins automatically pass all permission checks:

```php
Gate::before(function (User $user, string $ability) {
    if ($user->hasRole('super_admin')) {
        return true;
    }
});
```

## Frontend Implementation

### Permission Hooks

Save Workbench provides these hooks for permission checks:

```tsx
// Check a specific permission
const canViewVehicles = usePermission('view_vehicles');

// Check for a specific role
const isSuperAdmin = useRole('super_admin');

// Check if user has any of multiple permissions
const canManageVehicles = useHasAnyPermission(['create_vehicles', 'edit_vehicles']);

// Check if user belongs to a tenant
const isTenantUser = useTenantUser();
```

### Conditional Rendering

UI elements are conditionally rendered based on permissions:

```tsx
{usePermission('create_vehicles') && (
    <Button asChild>
        <Link href={route("vehicles.create")}>
            <Plus className="mr-2 h-4 w-4" />
            {__("vehicles.actions.create")}
        </Link>
    </Button>
)}
```

### Navigation

Sidebar navigation is built dynamically based on permissions:

```tsx
// Vehicles - requires view_vehicles permission
if (usePermission('view_vehicles')) {
    mainNavItems.push({
        title: __('vehicles.title'),
        href: '/vehicles',
        icon: Car,
    });
}
```

## Adding New Resources

When adding a new resource to the application:

1. Add the resource to the list in `PermissionSeeder.php`
2. Create a policy extending `BasePolicy` with the correct permission prefix
3. Register the policy in `AuthServiceProvider`
4. Assign permissions to appropriate roles in `PermissionSeeder.php` 
5. Apply the policy to controllers as described above
6. Use permission hooks in frontend components

## Testing Permissions

Always write tests to verify that your permission system works correctly:

```php
public function test_unauthorized_users_cannot_access_resource()
{
    $user = User::factory()->create();
    $user->assignRole('tenant_viewer');
    
    $response = $this->actingAs($user)->get(route('tenants.create'));
    
    $response->assertStatus(403);
}
```

## Troubleshooting

If permissions aren't working as expected:

1. Check that the user has the correct role assigned
2. Verify the role has the necessary permissions
3. Ensure the policy is registered in `AuthServiceProvider`
4. Confirm the policy permission prefix matches the seeded permissions
5. Make sure tenant isolation logic is working correctly if applicable 