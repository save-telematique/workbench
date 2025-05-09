<?php

namespace App\Actions\Users;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateUserAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        // For central users
        if (!$request->route('tenant')) {
            return $request->user()->can('update', $request->user);
        }
        
        // For tenant users
        return $request->user()->can('edit_tenant_users');
    }

    public function rules(ActionRequest $request): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($request->user),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'locale' => ['nullable', 'string', 'in:fr,en'],
        ];
    }

    public function handle(User $user, array $data, ?Tenant $tenant = null): User
    {
        // If this is a tenant user update, verify user belongs to tenant
        if ($tenant && $user->tenant_id !== $tenant->id) {
            throw new \InvalidArgumentException('User does not belong to the tenant');
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'locale' => $data['locale'] ?? $user->locale,
        ]);

        if (!empty($data['password'])) {
            $user->update([
                'password' => Hash::make($data['password']),
            ]);
        }

        return $user;
    }

    public function asController(ActionRequest $request, User $user, ?Tenant $tenant = null)
    {
        $this->handle($user, $request->validated(), $tenant);

        if ($tenant) {
            return to_route('tenants.users.show', [$tenant->id, $user->id])
                ->with('message', __('tenant_users.messages.updated'));
        }

        return to_route('users.show', $user)
            ->with('message', __('users.messages.updated'));
    }
} 