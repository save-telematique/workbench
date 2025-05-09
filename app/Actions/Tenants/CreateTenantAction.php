<?php

namespace App\Actions\Tenants;

use App\Models\Tenant;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateTenantAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Tenant::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'svg_logo' => ['nullable', 'string'],
        ];
    }

    public function handle(array $data): Tenant
    {
        $tenant = Tenant::create($data);
        
        return $tenant;
    }

    public function asController(ActionRequest $request)
    {
        $tenant = $this->handle($request->validated());

        return to_route('tenants.index')
            ->with('message', __('tenants.messages.created'));
    }
} 