<?php

namespace App\Actions\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class SendPasswordResetLinkAction
{
    use AsAction;

    /**
     * Get the validation rules for the action.
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email',
        ];
    }

    /**
     * Execute the action.
     */
    public function handle(array $data): string
    {
        return Password::sendResetLink(['email' => $data['email']]);
    }

    /**
     * Use the action as a controller.
     */
    public function asController(ActionRequest $request): RedirectResponse
    {
        $this->handle($request->validated());
        
        return back()->with('status', __('A reset link will be sent if the account exists.'));
    }
} 