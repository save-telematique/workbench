<?php

namespace App\Actions\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Lorisleiva\Actions\Concerns\AsAction;

class SendEmailVerificationNotificationAction
{
    use AsAction;

    /**
     * Execute the action.
     */
    public function handle(Request $request): bool
    {
        if ($request->user()->hasVerifiedEmail()) {
            return false;
        }

        $request->user()->sendEmailVerificationNotification();
        return true;
    }

    /**
     * Use the action as a controller.
     */
    public function asController(Request $request): RedirectResponse
    {
        $this->handle($request);
        
        return back()->with('status', 'verification-link-sent');
    }
} 