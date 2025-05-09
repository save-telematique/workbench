<?php

namespace App\Actions\Users;

use App\Models\User;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateUserRolesAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('edit_users');
    }

    public function rules(): array
    {
        return [
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ];
    }

    public function handle(User $user, array $roles): bool
    {
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

    public function asController(ActionRequest $request, User $user)
    {
        $this->handle($user, $request->validated()['roles']);

        return to_route('users.show', $user)
            ->with('message', __('users.messages.roles_updated'));
    }
} 