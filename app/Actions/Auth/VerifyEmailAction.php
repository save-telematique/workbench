<?php

namespace App\Actions\Auth;

use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Lorisleiva\Actions\Concerns\AsAction;

class VerifyEmailAction
{
    use AsAction;

    /**
     * Execute the action.
     */
    public function handle(EmailVerificationRequest $request): bool
    {
        if ($request->user()->hasVerifiedEmail()) {
            return false;
        }

        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();
            
            event(new Verified($user));
            return true;
        }

        return false;
    }

    /**
     * Use the action as a controller.
     */
    public function asController(EmailVerificationRequest $request): RedirectResponse
    {
        $this->handle($request);
        
        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
} 