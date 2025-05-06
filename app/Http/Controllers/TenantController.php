<?php

namespace App\Http\Controllers;

use App\Http\Requests\TenantStoreRequest;
use App\Http\Requests\TenantUpdateRequest;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $tenants = Tenant::all();
        
        return Inertia::render('tenants/index', [
            'tenants' => $tenants,
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
     * Store a newly created tenant in storage.
     */
    public function store(TenantStoreRequest $request): RedirectResponse
    {
        $tenant = Tenant::create($request->validated());

        return to_route('tenants.index')->with('message', __('tenants.messages.created'));
    }

    /**
     * Display the specified tenant.
     */
    public function show(Tenant $tenant): Response
    {
        return Inertia::render('tenants/show', [
            'tenant' => $tenant,
        ]);
    }

    /**
     * Show the form for editing the specified tenant.
     */
    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('tenants/edit', [
            'tenant' => $tenant,
        ]);
    }

    /**
     * Update the specified tenant in storage.
     */
    public function update(TenantUpdateRequest $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update($request->validated());

        return to_route('tenants.show', $tenant)->with('message', __('tenants.messages.updated'));
    }

    /**
     * Remove the specified tenant from storage.
     */
    public function destroy(Tenant $tenant): RedirectResponse
    {
        $tenant->delete();

        return to_route('tenants.index')->with('message', __('tenants.messages.deleted'));
    }
} 