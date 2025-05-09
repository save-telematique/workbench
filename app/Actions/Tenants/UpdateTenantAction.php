<?php

namespace App\Actions\Tenants;

use App\Models\Tenant;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateTenantAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->tenant);
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

    public function handle(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);
        
        return $tenant;
    }

    public function asController(ActionRequest $request, Tenant $tenant)
    {
        $this->handle($tenant, $request->validated());

        return to_route('tenants.show', $tenant)
            ->with('message', __('tenants.messages.updated'));
    }
} 