<?php

namespace App\Actions\Tenants;

use App\Models\Tenant;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteTenantAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->tenant);
    }

    public function handle(Tenant $tenant): bool
    {
        return $tenant->delete();
    }

    public function asController(ActionRequest $request, Tenant $tenant)
    {
        $this->handle($tenant);

        return to_route('tenants.index')
            ->with('message', __('tenants.messages.deleted'));
    }
} 