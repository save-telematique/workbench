<?php

namespace App\Http\Controllers\Groups;

use App\Http\Controllers\Controller;
use App\Http\Resources\Groups\GroupResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Models\Group;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Group::class, 'group');
    }

    /**
     * Display a listing of the groups.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        // Use Scout search if there's a search term, otherwise use regular query
        if (!empty($search)) {
            $query = Group::search($search)
                ->query(fn($query) => $query->with(['tenant', 'parent']))
                ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                    $query->where('tenant_id', $request->input('tenant_id'));
                })
                ->when($request->filled('parent_id') && $request->input('parent_id') !== 'all', function ($query) use ($request) {
                    return $request->input('parent_id') === 'root'
                        ? $query->whereNull('parent_id')
                        : $query->where('parent_id', $request->input('parent_id'));
                })
                ->when($request->filled('is_active') && $request->input('is_active') !== 'all', function ($query) use ($request) {
                    return $query->where('is_active', $request->input('is_active') === 'true');
                });
        } else {
            // Use regular Eloquent query for empty search
            $query = Group::query()
                ->with(['tenant', 'parent'])
                ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                    $query->where('tenant_id', $request->input('tenant_id'));
                })
                ->when($request->filled('parent_id') && $request->input('parent_id') !== 'all', function ($query) use ($request) {
                    return $request->input('parent_id') === 'root'
                        ? $query->whereNull('parent_id')
                        : $query->where('parent_id', $request->input('parent_id'));
                })
                ->when($request->filled('is_active') && $request->input('is_active') !== 'all', function ($query) use ($request) {
                    return $query->where('is_active', $request->input('is_active') === 'true');
                });
        }

        // Get all tenants for the filter (only for central users)
        $tenants = Auth::user()->tenant_id ? collect() : Tenant::select(['id', 'name'])->get();

        // Get all groups for parent filter
        $groupsForFilter = Group::with('parent')->get();

        // Paginate groups
        $groups = $query->paginate(10)->withQueryString();

        return Inertia::render('groups/index', [
            'groups' => GroupResource::collection($groups),
            'filters' => $request->only(['search', 'tenant_id', 'parent_id', 'is_active']),
            'tenants' => TenantResource::collection($tenants),
            'groupsForFilter' => GroupResource::collection($groupsForFilter),
        ]);
    }

    /**
     * Show the form for creating a new group.
     */
    public function create(): Response
    {
        $tenants = Auth::user()->tenant_id ? collect() : Tenant::select('id', 'name')->get();

        $parentGroups = Group::get();

        return Inertia::render('groups/create', [
            'tenants' => TenantResource::collection($tenants),
            'parentGroups' => GroupResource::collection($parentGroups),
        ]);
    }

    /**
     * Display the specified group.
     */
    public function show(Group $group): Response
    {
        $group->load([
            'tenant',
            'parent',
            'children',
            'vehicles.model.vehicleBrand',
            'vehicles.tenant',
            'drivers.tenant',
            'users'
        ]);

        return Inertia::render('groups/show', [
            'group' => new GroupResource($group),
        ]);
    }

    /**
     * Show the form for editing the specified group.
     */
    public function edit(Group $group): Response
    {
        $group->load(['tenant', 'parent']);

        $tenants = Auth::user()->tenant_id ? collect() : Tenant::select('id', 'name')->get();

        // Get potential parent groups (excluding self and descendants to prevent circular references)
        $parentGroups = Group::with('parent')
            ->where('id', '!=', $group->id)
            ->whereNotIn('id', $group->getAllDescendantIds())
            ->with('parent')
            ->get();

        return Inertia::render('groups/edit', [
            'group' => new GroupResource($group),
            'tenants' => TenantResource::collection($tenants),
            'parentGroups' => GroupResource::collection($parentGroups),
        ]);
    }
}
