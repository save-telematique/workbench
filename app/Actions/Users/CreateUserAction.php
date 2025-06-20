<?php

namespace App\Actions\Users;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateUserAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        // For central users
        if (!$request->route('tenant')) {
            return $request->user()->can('create', User::class);
        }
        
        // For tenant users
        return $request->user()->can('create_tenant_users');
    }

    public function rules(): array
    {
        $tenant = request()->route('tenant');
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->where(fn ($query) => $query->where('tenant_id', $tenant))],
            'locale' => ['nullable', 'string', 'in:fr,en'],
        ];

        return $rules;
    }

    public function handle(array $data, ?Tenant $tenant = null): User
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make(Str::random(32)), // Generate random password
            'locale' => $data['locale'] ?? config('app.locale'),
            'tenant_id' => $tenant ? $tenant->id : null,
        ];

        if (tenant('id') && !$tenant) {
            $userData['tenant_id'] = tenant('id');
        }

        return User::create($userData);
    }

    public function asController(ActionRequest $request)
    {
        $tenant = Tenant::find($request->route('tenant'));
        $user = $this->handle($request->validated(), $tenant);

        if ($tenant) {
            return to_route('tenants.users.index', $tenant->id)
                ->with('message', __('tenant_users.messages.created'));
        }
        
        return to_route('users.index')
            ->with('message', __('users.messages.created'));
    }
} 