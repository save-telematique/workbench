<?php

namespace App\Http\Controllers\Vehicles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicles\StoreVehicleRequest;
use App\Http\Requests\Vehicles\UpdateVehicleRequest;
use App\Models\Device;
use App\Models\Group;
use App\Models\Tenant;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Vehicles\VehicleBrandResource;
use App\Http\Resources\Vehicles\VehicleModelResource;
use App\Http\Resources\Vehicles\VehicleTypeResource;
use App\Http\Resources\Devices\DeviceResource;
use App\Http\Resources\Groups\GroupResource;

class VehicleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Vehicle::class, 'vehicle');
    }

    public function index(Request $request)
    {
        $query = Vehicle::search($request->input('search') ?? '')
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                return $query->where('tenant_id', $request->input('tenant_id'));
            })
            ->when($request->filled('brand') && $request->input('brand') !== 'all', function ($query) use ($request) {
                return $query->where('brand_name', $request->input('brand'));

            })
            ->when($request->filled('has_device') && $request->input('has_device') !== 'all', function ($query) use ($request) {
                return $request->input('has_device') === 'yes'
                    ? $query->query(fn ($q) => $q->whereHas('device'))
                    : $query->query(fn ($q) => $q->doesntHave('device'));
            });

        $query->query(fn ($q) => $q->with(['tenant', 'device.type', 'model.vehicleBrand', 'type', 'group']));

        $brandsForFilter = VehicleBrand::all();
        $tenantsForFilter = Tenant::all();

        $vehicles = $query->paginate(10)->withQueryString();

        return Inertia::render('vehicles/index', [
            'vehicles' => VehicleResource::collection($vehicles),
            'filters' => $request->only(['search', 'tenant_id', 'brand', 'has_device']),
            'brands' => VehicleBrandResource::collection($brandsForFilter),
            'tenants' => TenantResource::collection($tenantsForFilter),
        ]);
    }

    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['tenant', 'device.type', 'model.vehicleBrand', 'type', 'currentDriver', 'currentWorkingSession', 'currentLocation']);

        $tenantsForSelect = Tenant::select(['id', 'name'])->get();
        $devicesForSelect = Device::where(function ($query) use ($vehicle) {
            $query->whereNull('vehicle_id')
                  ->orWhere('vehicle_id', $vehicle->id);
        })
            ->with('type')
            ->get();
        $brandsForSelect = VehicleBrand::select('id', 'name')->get();

        return Inertia::render('vehicles/show', [
            'vehicle' => new VehicleResource($vehicle),
            'tenants' => TenantResource::collection($tenantsForSelect),
            'devices' => $devicesForSelect->map(fn($device) => new DeviceResource($device)),
            'brands' => VehicleBrandResource::collection($brandsForSelect),
        ]);
    }

    public function create()
    {
        $brands = VehicleBrand::select('id', 'name')->get();
        $models = VehicleModel::with('vehicleBrand')->get();
        $tenants = Tenant::select('id', 'name')->get();
        $devices = Device::whereNull('vehicle_id')->with('type')->get();
        $vehicleTypes = VehicleType::select('id', 'name')->get();
        
        // Get groups for the current user's tenant or all groups for central users
        $groups = Group::when(Auth::user()->tenant_id, function ($query) {
            $query->where('tenant_id', Auth::user()->tenant_id);
        })->active()->get();

        return Inertia::render('vehicles/create', [
            'brands' => VehicleBrandResource::collection($brands),
            'models' => VehicleModelResource::collection($models),
            'tenants' => TenantResource::collection($tenants),
            'devices' => DeviceResource::collection($devices),
            'vehicleTypes' => VehicleTypeResource::collection($vehicleTypes),
            'groups' => GroupResource::collection($groups),
        ]);
    }

    public function edit(Vehicle $vehicle)
    {
        $vehicle->load(['model.vehicleBrand', 'type', 'tenant', 'device.type', 'group']);

        $brands = VehicleBrand::select('id', 'name')->get();
        $models = VehicleModel::with('vehicleBrand')->get();
        $tenants = Tenant::select('id', 'name')->get();
        $vehicleTypes = VehicleType::select('id', 'name')->get();

        $devices = Device::where(function ($query) use ($vehicle) {
            $query->whereNull('vehicle_id')
                ->orWhere('vehicle_id', $vehicle->id);
        })
            ->with('type')
            ->get();
            
        // Get groups for the current user's tenant or all groups for central users
        $groups = Group::when(Auth::user()->tenant_id, function ($query) {
            $query->where('tenant_id', Auth::user()->tenant_id);
        })->active()->get();

        return Inertia::render('vehicles/edit', [
            'vehicle' => new VehicleResource($vehicle),
            'brands' => VehicleBrandResource::collection($brands),
            'models' => VehicleModelResource::collection($models),
            'tenants' => TenantResource::collection($tenants),
            'devices' => DeviceResource::collection($devices),
            'vehicleTypes' => VehicleTypeResource::collection($vehicleTypes),
            'groups' => GroupResource::collection($groups),
        ]);
    }
}
