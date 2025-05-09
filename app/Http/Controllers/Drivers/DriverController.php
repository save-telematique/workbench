<?php

namespace App\Http\Controllers\Drivers;

use App\Http\Controllers\Controller;
use App\Http\Resources\Drivers\DriverResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Users\UserResource;
use App\Models\Driver;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Driver::class, 'driver');
    }

    /**
     * Display a listing of the drivers.
     */
    public function index(Request $request)
    {
        $query = Driver::query()
            ->with(['tenant', 'user'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                return $query->where(function ($q) use ($search) {
                    $q->where('surname', 'like', "%{$search}%")
                      ->orWhere('firstname', 'like', "%{$search}%")
                      ->orWhere('license_number', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                return $query->where('tenant_id', $request->input('tenant_id'));
            });

        // Get all tenants for the filter
        $tenants = Tenant::select(['id', 'name'])->get();

        // Paginate drivers
        $drivers = $query->paginate(10)->withQueryString();

        return Inertia::render('drivers/index', [
            'drivers' => DriverResource::collection($drivers),
            'filters' => $request->only(['search', 'tenant_id']),
            'tenants' => TenantResource::collection($tenants),
        ]);
    }

    /**
     * Show the form for creating a new driver.
     */
    public function create()
    {
        $tenants = Tenant::select('id', 'name')->get();
        $users = User::whereNotNull('tenant_id')->get();

        return Inertia::render('drivers/create', [
            'tenants' => TenantResource::collection($tenants),
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Display the specified driver.
     */
    public function show(Driver $driver)
    {
        $driver->load(['tenant', 'user']);

        // Get all tenants and users for the select dialogs
        $tenants = Tenant::select(['id', 'name'])->get();
        $users = User::where('tenant_id', $driver->tenant_id)->get();

        return Inertia::render('drivers/show', [
            'driver' => new DriverResource($driver),
            'tenants' => TenantResource::collection($tenants),
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Show the form for editing the specified driver.
     */
    public function edit(Driver $driver)
    {
        $driver->load(['tenant', 'user']);
        
        $tenants = Tenant::select('id', 'name')->get();
        $users = User::whereNull('tenant_id')
            ->orWhere('tenant_id', $driver->tenant_id)
            ->get();

        return Inertia::render('drivers/edit', [
            'driver' => new DriverResource($driver),
            'tenants' => TenantResource::collection($tenants),
            'users' => UserResource::collection($users),
        ]);
    }
} 