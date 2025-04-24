<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Requests\GlobalSettings\VehicleBrands\StoreVehicleBrandRequest;
use App\Http\Requests\GlobalSettings\VehicleBrands\UpdateVehicleBrandRequest;
use App\Models\VehicleBrand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VehicleBrandController extends Controller
{
    /**
     * Display a listing of the vehicle brands.
     */
    public function index(): Response
    {
        $vehicleBrands = VehicleBrand::orderBy('name')->get();

        return Inertia::render('global-settings/vehicle-brands/index', [
            'vehicleBrands' => $vehicleBrands,
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
     * Store a newly created vehicle brand in storage.
     */
    public function store(StoreVehicleBrandRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('vehicle-brands', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        VehicleBrand::create($data);

        return to_route('global-settings.vehicle-brands.index')
            ->with('success', 'vehicle_brands.created');
    }

    /**
     * Show the form for editing the specified vehicle brand.
     */
    public function edit(VehicleBrand $vehicleBrand): Response
    {
        return Inertia::render('global-settings/vehicle-brands/edit', [
            'vehicleBrand' => $vehicleBrand,
        ]);
    }

    /**
     * Update the specified vehicle brand in storage.
     */
    public function update(UpdateVehicleBrandRequest $request, VehicleBrand $vehicleBrand): RedirectResponse
    {
        $data = $request->validated();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($vehicleBrand->logo_url) {
                $oldPath = str_replace('/storage/', '', $vehicleBrand->logo_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('logo')->store('vehicle-brands', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        $vehicleBrand->update($data);

        return to_route('global-settings.vehicle-brands.index')
            ->with('success', 'vehicle_brands.updated');
    }

    /**
     * Remove the specified vehicle brand from storage.
     */
    public function destroy(VehicleBrand $vehicleBrand): RedirectResponse
    {
        // Delete logo if exists
        if ($vehicleBrand->logo_url) {
            $path = str_replace('/storage/', '', $vehicleBrand->logo_url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $vehicleBrand->delete();

        return to_route('global-settings.vehicle-brands.index')
            ->with('success', 'vehicle_brands.deleted');
    }
} 