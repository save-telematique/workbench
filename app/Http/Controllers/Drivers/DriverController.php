<?php

namespace App\Http\Controllers\Drivers;

use App\Http\Controllers\Controller;
use App\Http\Resources\Drivers\DriverResource;
use App\Http\Resources\Groups\GroupResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Users\UserResource;
use App\Models\Driver;
use App\Models\Group;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $query = Driver::search($request->input('search', '') ?? '')
            ->query(fn ($query) => $query->with(['tenant', 'user', 'group']))
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                $query->where('tenant_id', $request->input('tenant_id'));
            })
            ->when($request->filled('user_id') && $request->input('user_id') !== 'all', function ($query) use ($request) {
                return $query->where('user_id', $request->input('user_id'));
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
        
        // Get groups for the current user's context
        $groups = Auth::user()->tenant_id 
            ? Group::where('tenant_id', Auth::user()->tenant_id)->where('is_active', true)->get()
            : Group::where('is_active', true)->get();

        return Inertia::render('drivers/create', [
            'tenants' => TenantResource::collection($tenants),
            'users' => UserResource::collection($users),
            'groups' => GroupResource::collection($groups),
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
        $driver->load(['tenant', 'user', 'group']);
        
        $tenants = Tenant::select('id', 'name')->get();
        $users = User::whereNull('tenant_id')
            ->orWhere('tenant_id', $driver->tenant_id)
            ->get();
            
        // Get groups for the current user's context
        $groups = Auth::user()->tenant_id 
            ? Group::where('tenant_id', Auth::user()->tenant_id)->where('is_active', true)->get()
            : Group::where('is_active', true)->get();

        return Inertia::render('drivers/edit', [
            'driver' => new DriverResource($driver),
            'tenants' => TenantResource::collection($tenants),
            'users' => UserResource::collection($users),
            'groups' => GroupResource::collection($groups),
        ]);
    }
} 