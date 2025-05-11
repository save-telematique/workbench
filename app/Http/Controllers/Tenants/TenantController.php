<?php

namespace App\Http\Controllers\Tenants;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenants\TenantResource;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->authorizeResource(Tenant::class, 'tenant');
    }

    /**
     * Display a listing of tenants.
     */
    public function index(): Response
    {
        $tenants = Tenant::search(request()->get('search', ''))
            ->orderBy(request()->get('sort', 'created_at'), request()->get('direction', 'desc'))
            ->paginate(request()->get('per_page', 10))
            ->withQueryString();
        
        return Inertia::render('tenants/index', [
            'tenants' => TenantResource::collection($tenants),
        ]);
    }

    /**
     * Show the form for creating a new tenant.
     */
    public function create(): Response
    {
        return Inertia::render('tenants/create');
    }

    /**
     * Display the specified tenant.
     */
    public function show(Tenant $tenant): Response
    {
        return Inertia::render('tenants/show', [
            'tenant' => new TenantResource($tenant),
        ]);
    }

    /**
     * Show the form for editing the specified tenant.
     */
    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('tenants/edit', [
            'tenant' => new TenantResource($tenant),
        ]);
    }
} 