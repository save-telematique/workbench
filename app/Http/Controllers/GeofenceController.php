<?php

namespace App\Http\Controllers;

use App\Http\Resources\GeofenceResource;
use App\Http\Resources\Groups\GroupResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Models\Geofence;
use App\Models\Group;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GeofenceController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Geofence::class, 'geofence');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Geofence::search($request->input('search') ?? '')
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                return $query->where('tenant_id', $request->input('tenant_id'));
            })
            ->when($request->filled('group_id') && $request->input('group_id') !== 'all', function ($query) use ($request) {
                return $query->where('group_id', $request->input('group_id'));
            })
            ->when($request->filled('is_active') && $request->input('is_active') !== 'all', function ($query) use ($request) {
                return $query->where('is_active', $request->input('is_active') === 'active');
            });

        $query->query(fn ($q) => $q->with(['tenant', 'group']));

        $geofences = $query->paginate(10)->withQueryString();

        // Get filter options
        $tenantsForFilter = Tenant::all();
        $groupsForFilter = Group::when(Auth::user()->tenant_id, function ($query) {
            $query->where('tenant_id', Auth::user()->tenant_id);
        })->get();

        return Inertia::render('geofences/index', [
            'geofences' => GeofenceResource::collection($geofences),
            'filters' => $request->only(['search', 'tenant_id', 'group_id', 'is_active']),
            'tenants' => TenantResource::collection($tenantsForFilter),
            'groups' => GroupResource::collection($groupsForFilter),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenants = Tenant::select('id', 'name')->get();
        
        // Get groups for the current user's tenant or all groups for central users
        $groups = Group::when(Auth::user()->tenant_id, function ($query) {
            $query->where('tenant_id', Auth::user()->tenant_id);
        })->active()->get();

        return Inertia::render('geofences/create', [
            'tenants' => TenantResource::collection($tenants),
            'groups' => GroupResource::collection($groups),
        ]);
    }



    /**
     * Display the specified resource.
     */
    public function show(Geofence $geofence)
    {
        $geofence->load(['tenant', 'group']);

        return Inertia::render('geofences/show', [
            'geofence' => new GeofenceResource($geofence),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Geofence $geofence)
    {
        $geofence->load(['tenant', 'group']);

        $tenants = Tenant::select('id', 'name')->get();
        
        // Get groups for the current user's tenant or all groups for central users
        $groups = Group::when(Auth::user()->tenant_id, function ($query) {
            $query->where('tenant_id', Auth::user()->tenant_id);
        })->active()->get();

        return Inertia::render('geofences/edit', [
            'geofence' => new GeofenceResource($geofence),
            'tenants' => TenantResource::collection($tenants),
            'groups' => GroupResource::collection($groups),
        ]);
    }


}
