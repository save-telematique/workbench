<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Http\Resources\Devices\DeviceResource;
use App\Http\Resources\Devices\DeviceTypeResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Models\Device;
use App\Models\DeviceType;
use App\Models\Tenant;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Database\Eloquent\Builder;

class DeviceController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Device::class, 'device');
    }

    public function index(Request $request): Response
    {
        $devices = Device::search($request->input('search') ?? '')
            ->query(fn (Builder $query) => $query->with(['type', 'vehicle', 'tenant']))
            ->when($request->tenant_id && $request->tenant_id !== 'all', function ($query) use ($request) {
                $query->where('tenant_id', $request->tenant_id);
            })
            ->when($request->device_type_id && $request->device_type_id !== 'all', function ($query) use ($request) {
                $query->where('device_type_id', $request->device_type_id);
            })
            ->when($request->vehicle_id, function ($query) use ($request) {
                $query->where('vehicle_id', $request->vehicle_id);
            })
            ->orderBy($request->input('sort', 'created_at'), $request->input('direction', 'desc'))
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        $deviceTypes = DeviceType::all();
        $tenants = Tenant::all();
        $vehicles = Vehicle::all();

        return Inertia::render('devices/index', [
            'devices' => DeviceResource::collection($devices),
            'filters' => $request->only(['search', 'trashed', 'tenant_id', 'device_type_id', 'vehicle_id']),
            'deviceTypes' => DeviceTypeResource::collection($deviceTypes),
            'tenants' => TenantResource::collection($tenants),
            'vehicles' => VehicleResource::collection($vehicles),
        ]);
    }

    public function create(): Response
    {
        $deviceTypes = DeviceType::all();
        $tenants = Tenant::all();
        $vehicles = Vehicle::all();

        return Inertia::render('devices/create', [
            'deviceTypes' => DeviceTypeResource::collection($deviceTypes),
            'tenants' => TenantResource::collection($tenants),
            'vehicles' => VehicleResource::collection($vehicles),
        ]);
    }

    public function show(Device $device): Response
    {
        $device->load([
            'type', 
            'vehicle.tenant', 
            'vehicle.model.vehicleBrand', 
            'tenant'
        ]);

        $deviceTypes = DeviceType::all();

        return Inertia::render('devices/show', [
            'device' => new DeviceResource($device),
            'deviceTypes' => DeviceTypeResource::collection($deviceTypes),
        ]);
    }

    public function edit(Device $device): Response
    {
        $device->load(['type', 'vehicle', 'tenant']);
        
        $deviceTypes = DeviceType::all();
        $tenants = Tenant::all();
        $vehicles = Vehicle::all();

        return Inertia::render('devices/edit', [
            'device' => new DeviceResource($device),
            'deviceTypes' => DeviceTypeResource::collection($deviceTypes),
            'tenants' => TenantResource::collection($tenants),
            'vehicles' => VehicleResource::collection($vehicles),
        ]);
    }
} 