<?php

namespace App\Actions\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class ConfirmPasswordAction
{
    use AsAction;

    /**
     * Get the validation rules for the action.
     */
    public function rules(): array
    {
        return [
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Execute the action.
     */
    public function handle(string $password): bool
    {
        return Auth::guard('web')->validate([
            'email' => Auth::user()->email,
            'password' => $password,
        ]);
    }

    /**
     * Use the action as a controller.
     */
    public function asController(ActionRequest $request): RedirectResponse
    {
        $confirmed = $this->handle($request->validated()['password']);
        
        if (!$confirmed) {
            return back()->withErrors([
                'password' => __('auth.password'),
            ]);
        }

        $request->session()->put('auth.password_confirmed_at', time());

        return redirect()->intended(route('dashboard', absolute: false));
    }
} 