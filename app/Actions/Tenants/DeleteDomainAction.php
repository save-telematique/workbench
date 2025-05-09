<?php

namespace App\Actions\Tenants;

use App\Models\Tenant;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;
use Stancl\Tenancy\Database\Models\Domain;

class DeleteDomainAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete_tenant_domains');
    }

    public function handle(Tenant $tenant, Domain $domain): bool
    {
        // Check if domain belongs to tenant
        if ($domain->tenant_id !== $tenant->id) {
            return false;
        }

        return $domain->delete();
    }

    public function asController(ActionRequest $request, Tenant $tenant, Domain $domain)
    {
        $this->handle($tenant, $domain);

        return back()->with('message', __('tenant_domains.messages.deleted'));
    }
} 