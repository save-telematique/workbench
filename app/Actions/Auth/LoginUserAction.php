<?php

namespace App\Actions\Auth;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Lorisleiva\Actions\Concerns\AsAction;

class LoginUserAction
{
    use AsAction;

    /**
     * Execute the action.
     */
    public function handle(LoginRequest $request): void
    {
        $request->authenticate();
        $request->session()->regenerate();
    }

    /**
     * Use the action as a controller.
     */
    public function asController(LoginRequest $request): RedirectResponse
    {
        $this->handle($request);
        
        return redirect()->intended(route('dashboard', absolute: false));
    }
} 