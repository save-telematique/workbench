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

        $permissionCollection = $user->getPermissionsViaRoles();
        $roleCollection = $user->getRoleNames();

        return Inertia::render('tenants/users/show', [
            'tenant' => new TenantResource($tenant),
            'user' => new UserResource($user),
            'permissions' => $permissionCollection,
            'roles' => $roleCollection,
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
} 