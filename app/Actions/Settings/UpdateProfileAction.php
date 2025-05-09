<?php

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateProfileAction
{
    use AsAction;

    public function rules(ActionRequest $request): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($request->user()->id),
            ],
        ];
    }

    public function handle(User $user, array $data): User
    {
        $user->fill($data);

        if ($user->isDirty('email') && $user instanceof MustVerifyEmail) {
            $user->email_verified_at = null;
        }

        $user->save();
        
        return $user;
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->user(), $request->validated());

        return to_route('profile.edit');
    }
} 