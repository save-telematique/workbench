<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Resources\Vehicles\VehicleTypeResource;
use App\Models\VehicleType;
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
        $vehicleTypes = VehicleType::orderBy('name')->paginate(request()->get('perPage', 10));

        return Inertia::render('global-settings/vehicle-types/index', [
            'vehicleTypes' => VehicleTypeResource::collection($vehicleTypes),
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
     * Show the form for editing the specified vehicle type.
     */
    public function edit(VehicleType $vehicleType): Response
    {
        return Inertia::render('global-settings/vehicle-types/edit', [
            'vehicleType' => new VehicleTypeResource($vehicleType),
        ]);
    }
} 