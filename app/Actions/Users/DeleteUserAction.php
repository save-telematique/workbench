<?php

namespace App\Actions\Users;

use App\Models\Tenant;
use App\Models\User;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteUserAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        // For central users
        if (!$request->route('tenant')) {
            return $request->user()->can('delete', $request->user);
        }
        
        // For tenant users
        return $request->user()->can('delete_tenant_users');
    }

    public function handle(User $user, ?Tenant $tenant = null): bool
    {
        // If this is a tenant user deletion, verify user belongs to tenant
        if ($tenant && $user->tenant_id !== $tenant->id) {
            throw new \InvalidArgumentException('User does not belong to the tenant');
        }
        
        return $user->delete();
    }

    public function asController(ActionRequest $request, User $user, ?Tenant $tenant = null)
    {
        $this->handle($user, $tenant);

        if ($tenant) {
            return to_route('tenants.users.index', $tenant->id)
                ->with('message', __('tenant_users.messages.deleted'));
        }

        return to_route('users.index')
            ->with('message', __('users.messages.deleted'));
    }
} 