<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::whereNull('tenant_id')->get();

        return Inertia::render('users/index', [
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
    public function create()
    {
        return Inertia::render('users/create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request)
    {
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'locale' => $request->locale ?? config('app.locale'),
        ]);

        return to_route('users.index')
            ->with('message', __('users.messages.created'));
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return Inertia::render('users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'locale' => $user->locale,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
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
    public function update(UpdateUserRequest $request, User $user)
    {
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

        return to_route('users.show', $user->id)
            ->with('message', __('users.messages.updated'));
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return to_route('users.index')
            ->with('message', __('users.messages.deleted'));
    }

    /**
     * Show the form for editing user roles.
     */
    public function editRoles(User $user)
    {
        $this->authorize('edit_users');

        // Filtrer les rôles en fonction du type d'utilisateur
        if ($user->tenant_id) {
            // Utilisateur d'un tenant: seulement rôles tenant
            $roles = Role::where('name', 'like', 'tenant_%')->get();
        } else {
            // Utilisateur central: seulement rôles centraux et super_admin
            $roles = Role::where(function($query) {
                $query->where('name', 'like', 'central_%')
                      ->orWhere('name', 'super_admin');
            })->get();
        }

        $roles = $roles->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $this->getRoleDescription($role->name),
            ];
        });

        return Inertia::render('users/roles', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'isTenant' => $user->tenant_id !== null,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the user's roles.
     */
    public function updateRoles(Request $request, User $user)
    {
        $this->authorize('edit_users');

        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        // Vérifier que les rôles sont compatibles avec le type d'utilisateur
        $roleNames = $validated['roles'];
        
        if ($user->tenant_id) {
            // Utilisateur d'un tenant: seulement rôles tenant
            $roleNames = array_filter($roleNames, function($roleName) {
                return str_starts_with($roleName, 'tenant_');
            });
        } else {
            // Utilisateur central: seulement rôles centraux et super_admin
            $roleNames = array_filter($roleNames, function($roleName) {
                return str_starts_with($roleName, 'central_') || $roleName === 'super_admin';
            });
        }

        $user->syncRoles($roleNames);

        return to_route('users.show', $user->id)
            ->with('message', __('users.messages.roles_updated'));
    }

    /**
     * Get a human-readable description for a role.
     */
    private function getRoleDescription(string $roleName): string
    {
        $descriptions = [
            'super_admin' => 'Super Administrator with full access',
            'central_admin' => 'Central Administrator with most access',
            'central_user' => 'Central standard user',
            'tenant_admin' => 'Tenant Administrator with full tenant access',
            'tenant_manager' => 'Tenant Manager with extensive access',
            'tenant_user' => 'Tenant standard user',
            'tenant_viewer' => 'Tenant user with view-only access',
        ];

        return $descriptions[$roleName] ?? $roleName;
    }
} 