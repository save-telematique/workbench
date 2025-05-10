<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Resources\Vehicles\VehicleBrandResource;
use App\Http\Resources\Vehicles\VehicleModelResource;
use App\Models\VehicleModel;
use App\Models\VehicleBrand;
use Inertia\Inertia;
use Inertia\Response;

class VehicleModelController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(VehicleModel::class, 'vehicle_model');
    }

    /**
     * Display a listing of the vehicle models.
     */
    public function index(): Response
    {
        $vehicleModels = VehicleModel::with(['vehicleBrand'])
            ->orderBy('name')
            ->paginate(request()->get('perPage', 10));

        return Inertia::render('global-settings/vehicle-models/index', [
            'vehicleModels' => VehicleModelResource::collection($vehicleModels),
        ]);
    }

    /**
     * Show the form for creating a new vehicle model.
     */
    public function create(): Response
    {
        $vehicleBrands = VehicleBrand::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-models/create', [
            'vehicleBrands' => VehicleBrandResource::collection($vehicleBrands),
        ]);
    }

    /**
     * Show the form for editing the specified vehicle model.
     */
    public function edit(VehicleModel $vehicleModel): Response
    {
        $vehicleBrands = VehicleBrand::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-models/edit', [
            'vehicleModel' => new VehicleModelResource($vehicleModel),
            'vehicleBrands' => VehicleBrandResource::collection($vehicleBrands),
        ]);
    }
} 