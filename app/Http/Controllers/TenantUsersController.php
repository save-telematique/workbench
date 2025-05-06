<?php

namespace App\Http\Controllers;

use App\Http\Requests\TenantUsers\StoreTenantUserRequest;
use App\Http\Requests\TenantUsers\UpdateTenantUserRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TenantUsersController extends Controller
{
    /**
     * Display a listing of the users for a specific tenant.
     */
    public function index(Tenant $tenant)
    {
        $this->authorize('view_tenant_users');
        
        $users = $tenant->users()->get();

        return Inertia::render('tenants/users/index', [
            'tenant' => $tenant->only('id', 'name'),
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Tenant $tenant)
    {
        $this->authorize('create_tenant_users');
        
        return Inertia::render('tenants/users/create', [
            'tenant' => $tenant->only('id', 'name'),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreTenantUserRequest $request, Tenant $tenant)
    {
        $this->authorize('create_tenant_users');
        
        $tenant->users()->create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'locale' => $request->locale ?? config('app.locale'),
        ]);

        return to_route('tenants.users.index', $tenant->id)
            ->with('message', __('tenant_users.messages.created'));
    }

    /**
     * Display the specified user.
     */
    public function show(Tenant $tenant, User $user)
    {
        $this->authorize('view_tenant_users');
        
        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }
        
        return Inertia::render('tenants/users/show', [
            'tenant' => $tenant->only('id', 'name'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'locale' => $user->locale,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Tenant $tenant, User $user)
    {
        $this->authorize('edit_tenant_users');
        
        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }
        
        return Inertia::render('tenants/users/edit', [
            'tenant' => $tenant->only('id', 'name'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'locale' => $user->locale,
            ],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateTenantUserRequest $request, Tenant $tenant, User $user)
    {
        $this->authorize('edit_tenant_users');
        
        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }
        
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'locale' => $request->locale,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return to_route('tenants.users.show', [$tenant->id, $user->id])
            ->with('message', __('tenant_users.messages.updated'));
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Tenant $tenant, User $user)
    {
        $this->authorize('delete_tenant_users');
        
        // Ensure the user belongs to the tenant
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }
        
        $user->delete();

        return to_route('tenants.users.index', $tenant->id)
            ->with('message', __('tenant_users.messages.deleted'));
    }
} 