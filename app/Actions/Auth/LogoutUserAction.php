<?php

namespace App\Actions\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\Concerns\AsAction;

class LogoutUserAction
{
    use AsAction;

    /**
     * Execute the action.
     */
    public function handle(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    /**
     * Use the action as a controller.
     */
    public function asController(Request $request): RedirectResponse
    {
        $this->handle($request);
        
        return redirect('/');
    }
} 