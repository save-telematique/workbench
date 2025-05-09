<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Resources\Vehicles\VehicleBrandResource;
use App\Models\VehicleBrand;
use Inertia\Inertia;
use Inertia\Response;

class VehicleBrandController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(VehicleBrand::class, 'vehicle_brand');
    }

    /**
     * Display a listing of the vehicle brands.
     */
    public function index(): Response
    {
        $vehicleBrands = VehicleBrand::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-brands/index', [
            'vehicleBrands' => VehicleBrandResource::collection($vehicleBrands),
        ]);
    }

    /**
     * Show the form for creating a new vehicle brand.
     */
    public function create(): Response
    {
        return Inertia::render('global-settings/vehicle-brands/create');
    }

    /**
     * Show the form for editing the specified vehicle brand.
     */
    public function edit(VehicleBrand $vehicleBrand): Response
    {
        return Inertia::render('global-settings/vehicle-brands/edit', [
            'vehicleBrand' => new VehicleBrandResource($vehicleBrand),
        ]);
    }
} 