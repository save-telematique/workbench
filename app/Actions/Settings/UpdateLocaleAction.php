<?php

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Http\Request;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateLocaleAction
{
    use AsAction;

    public function rules(): array
    {
        return [
            'locale' => ['required', 'string', 'in:en,fr'],
        ];
    }

    public function handle(?User $user, string $locale): bool
    {
        app()->setLocale($locale);
        
        if ($user) {
            $user->update([
                'locale' => $locale
            ]);
        }
        
        return true;
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->user(), $request->validated()['locale']);

        return response()->json(['message' => 'Locale updated successfully']);
    }
} 