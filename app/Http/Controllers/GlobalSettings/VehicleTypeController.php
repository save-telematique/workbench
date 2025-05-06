<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Requests\GlobalSettings\VehicleTypes\StoreVehicleTypeRequest;
use App\Http\Requests\GlobalSettings\VehicleTypes\UpdateVehicleTypeRequest;
use App\Models\VehicleType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleTypeController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(VehicleType::class, 'vehicle_type');
    }

    /**
     * Display a listing of the vehicle types.
     */
    public function index(): Response
    {
        $vehicleTypes = VehicleType::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-types/index', [
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Show the form for creating a new vehicle type.
     */
    public function create(): Response
    {
        return Inertia::render('global-settings/vehicle-types/create');
    }

    /**
     * Store a newly created vehicle type in storage.
     */
    public function store(StoreVehicleTypeRequest $request): RedirectResponse
    {
        VehicleType::create($request->validated());

        return to_route('global-settings.vehicle-types.index')
            ->with('success', 'vehicle_types.created');
    }

    /**
     * Show the form for editing the specified vehicle type.
     */
    public function edit(VehicleType $vehicleType): Response
    {
        return Inertia::render('global-settings/vehicle-types/edit', [
            'vehicleType' => $vehicleType,
        ]);
    }

    /**
     * Update the specified vehicle type in storage.
     */
    public function update(UpdateVehicleTypeRequest $request, VehicleType $vehicleType): RedirectResponse
    {
        $vehicleType->update($request->validated());

        return to_route('global-settings.vehicle-types.index')
            ->with('success', 'vehicle_types.updated');
    }

    /**
     * Remove the specified vehicle type from storage.
     */
    public function destroy(VehicleType $vehicleType): RedirectResponse
    {
        $vehicleType->delete();

        return to_route('global-settings.vehicle-types.index')
            ->with('success', 'vehicle_types.deleted');
    }
} 