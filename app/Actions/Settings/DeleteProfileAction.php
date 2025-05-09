<?php

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteProfileAction
{
    use AsAction;

    public function rules(): array
    {
        return [
            'password' => ['required', 'current_password'],
        ];
    }

    public function handle(User $user): bool
    {
        return $user->delete();
    }

    public function asController(ActionRequest $request)
    {
        $user = $request->user();
        
        $this->handle($user);

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
} 