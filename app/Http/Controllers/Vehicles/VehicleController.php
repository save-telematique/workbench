<?php

namespace App\Http\Controllers\Vehicles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicles\StoreVehicleRequest;
use App\Http\Requests\Vehicles\UpdateVehicleRequest;
use App\Models\Device;
use App\Models\Tenant;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Http\Resources\Tenants\TenantResource;
use App\Http\Resources\Vehicles\VehicleBrandResource;
use App\Http\Resources\Vehicles\VehicleModelResource;
use App\Http\Resources\Vehicles\VehicleTypeResource;
use App\Http\Resources\Devices\DeviceResource;

class VehicleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Vehicle::class, 'vehicle');
    }

    public function index(Request $request)
    {
        $query = Vehicle::query()
            ->with(['tenant', 'device.type', 'model.vehicleBrand', 'type'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                return $query->where(function ($q) use ($search) {
                    $q->where('registration', 'like', "%{$search}%")
                        ->orWhereHas('model.vehicleBrand', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('model', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhere('vin', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                return $query->where('tenant_id', $request->input('tenant_id'));
            })
            ->when($request->filled('brand') && $request->input('brand') !== 'all', function ($query) use ($request) {
                return $query->whereHas('model.vehicleBrand', function ($q) use ($request) {
                    $q->where('name', $request->input('brand'));
                });
            })
            ->when($request->filled('has_device') && $request->input('has_device') !== 'all', function ($query) use ($request) {
                return $request->input('has_device') === 'yes'
                    ? $query->whereHas('device')
                    : $query->doesntHave('device');
            });

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
        $vehicle->load(['tenant', 'device.type', 'model.vehicleBrand', 'type']);

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

        return Inertia::render('vehicles/create', [
            'brands' => VehicleBrandResource::collection($brands),
            'models' => VehicleModelResource::collection($models),
            'tenants' => TenantResource::collection($tenants),
            'devices' => DeviceResource::collection($devices),
            'vehicleTypes' => VehicleTypeResource::collection($vehicleTypes),
        ]);
    }

    public function edit(Vehicle $vehicle)
    {
        $vehicle->load(['model.vehicleBrand', 'type', 'tenant', 'device.type']);

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

        return Inertia::render('vehicles/edit', [
            'vehicle' => new VehicleResource($vehicle),
            'brands' => VehicleBrandResource::collection($brands),
            'models' => VehicleModelResource::collection($models),
            'tenants' => TenantResource::collection($tenants),
            'devices' => DeviceResource::collection($devices),
            'vehicleTypes' => VehicleTypeResource::collection($vehicleTypes),
        ]);
    }
}
