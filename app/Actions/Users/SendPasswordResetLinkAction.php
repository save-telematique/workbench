<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Support\Facades\Password;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class SendPasswordResetLinkAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        // Get the user from route parameter (auto-resolved by Laravel)
        $targetUser = $request->route('user');
        
        // For central users
        if (!$request->route('tenant')) {
            return $request->user()->can('edit_users');
        }
        
        // For tenant users - check permission and tenant ownership
        if (!$request->user()->can('edit_tenant_users')) {
            return false;
        }
        
        // Ensure target user belongs to the tenant (for tenant context)
        $tenant = $request->route('tenant');
        if ($tenant && $targetUser->tenant_id !== $tenant->id) {
            return false;
        }
        
        return true;
    }

    public function handle(User $user): string
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return 'success';
        }

        return 'error';
    }

    public function asController(ActionRequest $request)
    {
        $user = $request->route('user');
        
        $status = $this->handle($user);
        
        $tenant = $user->tenant_id ? $user->tenant : null;

        if ($status === 'success') {
            $message = $tenant 
                ? __('tenant_users.messages.password_reset_sent') 
                : __('users.messages.password_reset_sent');
        } else {
            $message = $tenant 
                ? __('tenant_users.messages.password_reset_failed') 
                : __('users.messages.password_reset_failed');
        }

        return back()->with($status === 'success' ? 'message' : 'error', $message);
    }
} 