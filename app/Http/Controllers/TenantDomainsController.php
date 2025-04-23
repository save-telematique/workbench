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
        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:255', 'unique:domains,domain'],
        ]);

        // Utiliser directement le domaine saisi, sans modifier
        $tenant->domains()->create([
            'domain' => $validated['domain'],
        ]);

        return back()->with('message', 'Domain added successfully.');
    }

    /**
     * Remove the specified domain from storage.
     */
    public function destroy(Tenant $tenant, Domain $domain): RedirectResponse
    {
        // Check if domain belongs to tenant
        if ($domain->tenant_id !== $tenant->id) {
            abort(403);
        }

        $domain->delete();

        return back()->with('message', 'Domain deleted successfully.');
    }
} 