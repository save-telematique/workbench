<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Resources\Users\UserResource;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
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
    public function index(): Response
    {
        $users = User::where('tenant_id', tenant('id'))->paginate(request()->get('perPage', 10));

        return Inertia::render('users/index', [
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('users/create');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load('roles');
        
        return Inertia::render('users/show', [
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Show the form for editing user roles.
     */
    public function editRoles(User $user): Response
    {
        $this->authorize('edit_users');

        // Filter roles based on user type
        if ($user->tenant_id) {
            // Tenant user: only tenant roles
            $roles = Role::where('name', 'like', 'tenant_%')->get();
        } else {
            // Central user: only central roles and super_admin
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

        $user->load('roles');

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