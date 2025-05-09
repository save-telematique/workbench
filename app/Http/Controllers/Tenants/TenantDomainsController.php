<?php

namespace App\Http\Controllers\Tenants;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenants\DomainResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

class TenantDomainsController extends Controller
{
    /**
     * Display a listing of the domains for the tenant.
     */
    public function index(Tenant $tenant): Response
    {
        $this->authorize('view_tenant_domains');
        
        return Inertia::render('tenants/domains', [
            'tenant' => new TenantResource($tenant),
            'domains' => DomainResource::collection($tenant->domains),
            'app_url' => config('app.url'),
        ]);
    }
} 