<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Requests\GlobalSettings\VehicleModels\StoreVehicleModelRequest;
use App\Http\Requests\GlobalSettings\VehicleModels\UpdateVehicleModelRequest;
use App\Models\VehicleModel;
use App\Models\VehicleBrand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleModelController extends Controller
{
    /**
     * Display a listing of the vehicle models.
     */
    public function index(): Response
    {
        $vehicleModels = VehicleModel::with(['vehicleBrand'])
            ->orderBy('name')
            ->get();

        return Inertia::render('global-settings/vehicle-models/index', [
            'vehicleModels' => $vehicleModels,
        ]);
    }

    /**
     * Show the form for creating a new vehicle model.
     */
    public function create(): Response
    {
        $vehicleBrands = VehicleBrand::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-models/create', [
            'vehicleBrands' => $vehicleBrands,
        ]);
    }

    /**
     * Store a newly created vehicle model in storage.
     */
    public function store(StoreVehicleModelRequest $request): RedirectResponse
    {
        VehicleModel::create($request->validated());

        return to_route('global-settings.vehicle-models.index')
            ->with('success', 'vehicle_models.created');
    }

    /**
     * Show the form for editing the specified vehicle model.
     */
    public function edit(VehicleModel $vehicleModel): Response
    {
        $vehicleBrands = VehicleBrand::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-models/edit', [
            'vehicleModel' => $vehicleModel,
            'vehicleBrands' => $vehicleBrands,
        ]);
    }

    /**
     * Update the specified vehicle model in storage.
     */
    public function update(UpdateVehicleModelRequest $request, VehicleModel $vehicleModel): RedirectResponse
    {
        $vehicleModel->update($request->validated());

        return to_route('global-settings.vehicle-models.index')
            ->with('success', 'vehicle_models.updated');
    }

    /**
     * Remove the specified vehicle model from storage.
     */
    public function destroy(VehicleModel $vehicleModel): RedirectResponse
    {
        $vehicleModel->delete();

        return to_route('global-settings.vehicle-models.index')
            ->with('success', 'vehicle_models.deleted');
    }
} 