<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Database\Models\Domain;

class TenantDomainsController extends Controller
{
    /**
     * Display a listing of the domains for the tenant.
     */
    public function index(Tenant $tenant): Response
    {
        $this->authorize('view_tenant_domains');
        
        return Inertia::render('tenants/domains', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
            'domains' => $tenant->domains->map(function ($domain) {
                return [
                    'id' => $domain->id,
                    'domain' => $domain->domain,
                ];
            }),
            'app_url' => config('app.url'),
        ]);
    }

    /**
     * Store a newly created domain in storage.
     */
    public function store(Request $request, Tenant $tenant): RedirectResponse
    {
        $this->authorize('create_tenant_domains');
        
        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:255', 'unique:domains,domain'],
        ]);

        $tenant->domains()->create([
            'domain' => $validated['domain'],
        ]);

        return back()->with('message', __('tenant_domains.messages.created'));
    }

    /**
     * Remove the specified domain from storage.
     */
    public function destroy(Tenant $tenant, Domain $domain): RedirectResponse
    {
        $this->authorize('delete_tenant_domains');
        
        // Check if domain belongs to tenant
        if ($domain->tenant_id !== $tenant->id) {
            abort(404);
        }

        $domain->delete();

        return back()->with('message', __('tenant_domains.messages.deleted'));
    }
} 