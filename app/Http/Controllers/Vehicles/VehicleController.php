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
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    /**
     * Display a listing of the vehicles.
     */
    public function index(Request $request)
    {
        $query = Vehicle::query()
            ->with(['tenant', 'device', 'device.type', 'model', 'model.vehicleBrand', 'type'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                return $query->where(function ($q) use ($search) {
                    $q->where('registration', 'like', "%{$search}%")
                      ->orWhereHas('model.vehicleBrand', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('model', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      })
                      ->orWhere('vin', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                return $query->where('tenant_id', $request->input('tenant_id'));
            })
            ->when($request->filled('brand') && $request->input('brand') !== 'all', function ($query) use ($request) {
                return $query->whereHas('model.vehicleBrand', function($q) use ($request) {
                    $q->where('name', $request->input('brand'));
                });
            })
            ->when($request->filled('has_device') && $request->input('has_device') !== 'all', function ($query) use ($request) {
                return $request->input('has_device') === 'yes'
                    ? $query->whereNotNull('device_id')
                    : $query->whereNull('device_id');
            });

        // Get unique brands for the filter
        $brands = VehicleBrand::select('name')->distinct()->pluck('name')->toArray();

        // Get all tenants for the filter
        $tenants = Tenant::select('id', 'name')->get();

        // Paginate vehicles and transform data
        $vehicles = $query->paginate(10)->withQueryString()->through(function ($vehicle) {
            return [
                'id' => $vehicle->id,
                'registration' => $vehicle->registration,
                'brand' => $vehicle->model->vehicleBrand->name ?? null,
                'model' => $vehicle->model->name ?? null,
                'color' => $vehicle->color,
                'vin' => $vehicle->vin,
                'year' => $vehicle->year,
                'tenant' => $vehicle->tenant ? [
                    'id' => $vehicle->tenant->id,
                    'name' => $vehicle->tenant->name,
                ] : null,
                'device' => $vehicle->device ? [
                    'id' => $vehicle->device->id,
                    'serial_number' => $vehicle->device->serial_number,
                ] : null,
                'deleted_at' => $vehicle->deleted_at,
            ];
        });

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles,
            'filters' => $request->only(['search', 'tenant_id', 'brand', 'has_device']),
            'brands' => $brands,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Show the form for creating a new vehicle.
     */
    public function create()
    {
        $brands = VehicleBrand::select('id', 'name')->get();
        $models = VehicleModel::with('vehicleBrand')->get()->map(function ($model) {
            return [
                'id' => $model->id,
                'name' => $model->name,
                'brand_id' => $model->vehicle_brand_id,
                'brand_name' => $model->vehicleBrand->name,
            ];
        });
        $tenants = Tenant::select('id', 'name')->get();
        $devices = Device::whereNull('vehicle_id')->with('type')->get()->map(function ($device) {
            return [
                'id' => $device->id,
                'serial_number' => $device->serial_number,
            ];
        });

        return Inertia::render('vehicles/create', [
            'brands' => $brands,
            'models' => $models,
            'tenants' => $tenants,
            'devices' => $devices,
        ]);
    }

    /**
     * Store a newly created vehicle in storage.
     */
    public function store(StoreVehicleRequest $request)
    {
        $validatedData = $request->validated();

        // Handle nullable relationships
        if ($validatedData['tenant_id'] === 'none') {
            $validatedData['tenant_id'] = null;
        }

        if ($validatedData['device_id'] === 'none') {
            $validatedData['device_id'] = null;
        }

        // Get vehicle_model_id based on the selected model
        if (!empty($validatedData['model_id'])) {
            $validatedData['vehicle_model_id'] = $validatedData['model_id'];
            unset($validatedData['model_id']);
        }
        
        // Remove brand field as it's not in the database
        if (isset($validatedData['brand'])) {
            unset($validatedData['brand']);
        }

        $vehicle = Vehicle::create($validatedData);

        // Update device to reference this vehicle if assigned
        if (!empty($validatedData['device_id']) && $validatedData['device_id'] !== 'none') {
            Device::where('id', $validatedData['device_id'])->update(['vehicle_id' => $vehicle->id]);
        }

        return to_route('vehicles.index');
    }

    /**
     * Display the specified vehicle.
     */
    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['tenant', 'device', 'device.type', 'model', 'model.vehicleBrand', 'type']);

        $vehicleData = [
            'id' => $vehicle->id,
            'registration' => $vehicle->registration,
            'brand' => $vehicle->model->vehicleBrand->name ?? null,
            'model' => $vehicle->model->name ?? null,
            'color' => $vehicle->color,
            'vin' => $vehicle->vin,
            'year' => $vehicle->year,
            'tenant' => $vehicle->tenant ? [
                'id' => $vehicle->tenant->id,
                'name' => $vehicle->tenant->name,
            ] : null,
            'device' => $vehicle->device ? [
                'id' => $vehicle->device->id,
                'serial_number' => $vehicle->device->serial_number,
            ] : null,
        ];

        return Inertia::render('vehicles/show', [
            'vehicle' => $vehicleData,
        ]);
    }

    /**
     * Show the form for editing the specified vehicle.
     */
    public function edit(Vehicle $vehicle)
    {
        $vehicle->load(['model', 'model.vehicleBrand']);
        
        $brands = VehicleBrand::select('id', 'name')->get();
        $models = VehicleModel::with('vehicleBrand')->get()->map(function ($model) {
            return [
                'id' => $model->id,
                'name' => $model->name,
                'brand_id' => $model->vehicle_brand_id,
                'brand_name' => $model->vehicleBrand->name,
            ];
        });
        $tenants = Tenant::select('id', 'name')->get();
        
        // Get available devices (not assigned to any vehicle or assigned to this vehicle)
        $devices = Device::where(function ($query) use ($vehicle) {
                $query->whereNull('vehicle_id')
                      ->orWhere('vehicle_id', $vehicle->id);
            })
            ->with('type')
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'serial_number' => $device->serial_number,
                ];
            });

        $vehicleData = [
            'id' => $vehicle->id,
            'registration' => $vehicle->registration,
            'model_id' => $vehicle->vehicle_model_id,
            'brand_id' => $vehicle->model->vehicle_brand_id ?? null,
            'color' => $vehicle->color,
            'vin' => $vehicle->vin,
            'year' => $vehicle->year,
            'tenant_id' => $vehicle->tenant_id,
            'device_id' => $vehicle->device_id,
        ];

        return Inertia::render('vehicles/edit', [
            'vehicle' => $vehicleData,
            'brands' => $brands,
            'models' => $models,
            'tenants' => $tenants,
            'devices' => $devices,
        ]);
    }

    /**
     * Update the specified vehicle in storage.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle)
    {
        $validatedData = $request->validated();

        // Handle nullable relationships
        if ($validatedData['tenant_id'] === 'none') {
            $validatedData['tenant_id'] = null;
        }

        // Handle device relationship
        $oldDeviceId = $vehicle->device_id;
        $newDeviceId = $validatedData['device_id'] === 'none' ? null : $validatedData['device_id'];

        if ($validatedData['device_id'] === 'none') {
            $validatedData['device_id'] = null;
        }

        // Get vehicle_model_id based on the selected model
        if (!empty($validatedData['model_id'])) {
            $validatedData['vehicle_model_id'] = $validatedData['model_id'];
            unset($validatedData['model_id']);
        }
        
        // Remove brand field as it's not in the database
        if (isset($validatedData['brand'])) {
            unset($validatedData['brand']);
        }

        $vehicle->update($validatedData);

        // Update device associations
        if ($oldDeviceId && $oldDeviceId !== $newDeviceId) {
            // Clear the vehicle_id from the old device
            Device::where('id', $oldDeviceId)->update(['vehicle_id' => null]);
        }

        if ($newDeviceId && $oldDeviceId !== $newDeviceId) {
            // Set the vehicle_id on the new device
            Device::where('id', $newDeviceId)->update(['vehicle_id' => $vehicle->id]);
        }

        return to_route('vehicles.show', $vehicle);
    }

    /**
     * Remove the specified vehicle from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        // Remove any device associations
        if ($vehicle->device_id) {
            Device::where('id', $vehicle->device_id)->update(['vehicle_id' => null]);
        }
        
        $vehicle->delete();

        return to_route('vehicles.index');
    }

    /**
     * Restore the specified soft-deleted vehicle.
     */
    public function restore($id)
    {
        Vehicle::withTrashed()->findOrFail($id)->restore();

        return to_route('vehicles.index');
    }
} 