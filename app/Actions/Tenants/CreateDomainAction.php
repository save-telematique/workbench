<?php

namespace App\Actions\Tenants;

use App\Models\Tenant;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateDomainAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create_tenant_domains');
    }

    public function rules(): array
    {
        return [
            'domain' => ['required', 'string', 'max:255', 'unique:domains,domain'],
        ];
    }

    public function handle(Tenant $tenant, string $domain)
    {
        return $tenant->domains()->create([
            'domain' => $domain,
        ]);
    }

    public function asController(ActionRequest $request, Tenant $tenant)
    {
        $this->handle($tenant, $request->validated()['domain']);

        return back()->with('message', __('tenant_domains.messages.created'));
    }
} 