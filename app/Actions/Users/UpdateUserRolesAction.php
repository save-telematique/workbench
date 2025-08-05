<?php

namespace App\Actions\Users;

use App\Models\Tenant;
use App\Models\User;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateUserRolesAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        // For central users
        if (!$request->route('tenant')) {
            return $request->user()->can('edit_users');
        }
        
        // For tenant users
        return $request->user()->can('edit_tenant_users');
    }

    public function rules(): array
    {
        return [
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ];
    }

    public function handle(User $user, array $roles, ?Tenant $tenant = null): bool
    {
        // If this is a tenant user update, verify user belongs to tenant
        if ($tenant && $user->tenant_id !== $tenant->id) {
            throw new \InvalidArgumentException('User does not belong to the tenant');
        }

        // Filter roles based on user type
        if ($user->tenant_id) {
            // Tenant user: only tenant roles
            $roles = array_filter($roles, function($roleName) {
                return str_starts_with($roleName, 'tenant_');
            });
        } else {
            // Central user: only central roles and super_admin
            $roles = array_filter($roles, function($roleName) {
                return str_starts_with($roleName, 'central_') || $roleName === 'super_admin';
            });
        }

        $user->syncRoles($roles);
        
        return true;
    }

    public function asController(ActionRequest $request)
    {
        // Extract parameters manually like CreateUserAction does
        $tenant = $request->route('tenant') ? Tenant::find($request->route('tenant')) : null;
        $user = User::findOrFail($request->route('user'));

        $this->handle($user, $request->validated()['roles'], $tenant);

        if ($tenant) {
            return to_route('tenants.users.show', [$tenant->id, $user->id])
                ->with('message', __('tenant_users.messages.roles_updated'));
        }

        return to_route('users.show', $user)
            ->with('message', __('users.messages.roles_updated'));
    }
} 