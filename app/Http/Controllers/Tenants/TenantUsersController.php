<?php

namespace App\Http\Controllers\Tenants;

use App\Actions\Users\UpdateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Users\UserResource;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class TenantUsersController extends Controller
{
    /**
     * Display a listing of the users for a specific tenant.
     */
    public function index(Tenant $tenant): Response
    {
        $this->authorize('view_tenant_users');
        
        $users = $tenant->users()->paginate(request()->get('per_page', 10));

        return Inertia::render('tenants/users/index', [
            'tenant' => new TenantResource($tenant),
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Tenant $tenant): Response
    {
        $this->authorize('create_tenant_users');
        
        return Inertia::render('tenants/users/create', [
            'tenant' => new TenantResource($tenant),
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(Tenant $tenant, User $user): Response
    {
        $this->authorize('view_tenant_users');
        
        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }

        $user->load('roles');

        return Inertia::render('tenants/users/show', [
            'tenant' => new TenantResource($tenant),
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Tenant $tenant, User $user): Response
    {
        $this->authorize('edit_tenant_users');
        
        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }
        
        return Inertia::render('tenants/users/edit', [
            'tenant' => new TenantResource($tenant),
            'user' => new UserResource($user),
        ]);
    }

    public function store(Tenant $tenant, User $user): Response
    {
        $this->authorize('create_tenant_users');
        
        return Inertia::render('tenants/users/create', [
            'tenant' => new TenantResource($tenant),
        ]);
    }

    /**
     * Show the form for editing user roles.
     */
    public function editRoles(Tenant $tenant, User $user): Response
    {
        $this->authorize('edit_tenant_users');

        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }

        // Only show tenant roles for tenant users
        $roles = Role::where('name', 'like', 'tenant_%')->get();

        $roles = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $this->getRoleDescription($role->name),
            ];
        });

        $user->load('roles');

        return Inertia::render('tenants/users/roles', [
            'tenant' => new TenantResource($tenant),
            'user' => new UserResource($user),
            'roles' => $roles,
        ]);
    }

    /**
     * Get a human-readable description for a role.
     */
    private function getRoleDescription(string $roleName): string
    {
        $descriptions = [
            'tenant_admin' => 'Tenant Administrator with full tenant access',
            'tenant_manager' => 'Tenant Manager with extensive access',
            'tenant_user' => 'Tenant standard user',
            'tenant_viewer' => 'Tenant user with view-only access',
        ];

        return $descriptions[$roleName] ?? $roleName;
    }
} 