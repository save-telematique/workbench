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
        $user = $request->route('user');
        
        // For central users
        if (!$user->tenant_id) {
            return $request->user()->can('edit_users');
        }
        
        // For tenant users
        return $request->user()->can('edit_tenant_users');
    }

    public function handle(User $user): string
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return 'success';
        }

        return 'error';
    }

    public function asController(ActionRequest $request, User $user)
    {
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

        if ($tenant) {
            return back()->with($status === 'success' ? 'message' : 'error', $message);
        }
        
        return back()->with($status === 'success' ? 'message' : 'error', $message);
    }
} 