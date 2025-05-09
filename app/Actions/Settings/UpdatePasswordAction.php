<?php

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdatePasswordAction
{
    use AsAction;

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ];
    }

    public function handle(User $user, string $password): User
    {
        $user->update([
            'password' => Hash::make($password),
        ]);
        
        return $user;
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->user(), $request->validated()['password']);

        return back();
    }
} 