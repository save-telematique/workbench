<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Http\Requests\Devices\AssignVehicleRequest;
use App\Http\Requests\Devices\StoreDeviceRequest;
use App\Http\Requests\Devices\UpdateDeviceRequest;
use App\Models\Device;
use App\Models\DeviceType;
use App\Models\Tenant;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    /**
     * Display a listing of the devices.
     */
    public function index(Request $request): Response
    {

        //$devices = Device::search($request->search)
        $devices = Device::query()
            ->with(['type', 'vehicle', 'tenant'])
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

        return Inertia::render('devices/index', [
            'devices' => $devices,
            'filters' => $request->only(['search', 'trashed', 'tenant_id', 'device_type_id', 'vehicle_id']),
            'deviceTypes' => $deviceTypes,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Show the form for creating a new device.
     */
    public function create(): Response
    {
        $deviceTypes = DeviceType::all();
        $tenants = Tenant::all();
        $vehicles = Vehicle::all();

        return Inertia::render('devices/create', [
            'deviceTypes' => $deviceTypes,
            'tenants' => $tenants,
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Store a newly created device in storage.
     */
    public function store(StoreDeviceRequest $request): RedirectResponse
    {
        Device::create($request->validated());

        return to_route('devices.index')
            ->with('success', __('devices.created'));
    }

    /**
     * Display the specified device.
     */
    public function show(Device $device): Response
    {
        $device->load(['type', 'vehicle', 'tenant']);

        return Inertia::render('devices/show', [
            'device' => $device,
        ]);
    }

    /**
     * Show the form for editing the specified device.
     */
    public function edit(Device $device): Response
    {
        $device->load(['type', 'vehicle', 'tenant']);
        
        $deviceTypes = DeviceType::all();
        $tenants = Tenant::all();
        $vehicles = Vehicle::all();

        return Inertia::render('devices/edit', [
            'device' => $device,
            'deviceTypes' => $deviceTypes,
            'tenants' => $tenants,
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Update the specified device in storage.
     */
    public function update(UpdateDeviceRequest $request, Device $device): RedirectResponse
    {
        $device->update($request->validated());

        return to_route('devices.index')
            ->with('success', __('devices.updated'));
    }

    /**
     * Remove the specified device from storage.
     */
    public function destroy(Device $device): RedirectResponse
    {
        $device->delete();

        return to_route('devices.index')
            ->with('success', __('devices.deleted'));
    }

    /**
     * Restore the specified device from storage.
     */
    public function restore(Device $device): RedirectResponse
    {
        $device->restore();

        return to_route('devices.index')
            ->with('success', __('devices.restored'));
    }

    /**
     * Force delete the specified device from storage.
     */
    public function forceDelete(Device $device): RedirectResponse
    {
        $device->forceDelete();

        return to_route('devices.index')
            ->with('success', __('devices.force_deleted'));
    }

    /**
     * Assign a vehicle to the specified device.
     */
    public function assignVehicle(Device $device, AssignVehicleRequest $request): RedirectResponse
    {
        $device->update([
            'vehicle_id' => $request->vehicle_id,
        ]);

        return to_route('devices.show', $device)
            ->with('success', __('devices.vehicle_assigned'));
    }

    /**
     * Unassign a vehicle from the specified device.
     */
    public function unassignVehicle(Device $device): RedirectResponse
    {
        $device->update([
            'vehicle_id' => null,
        ]);

        return to_route('devices.show', $device)
            ->with('success', __('devices.vehicle_unassigned'));
    }
} 