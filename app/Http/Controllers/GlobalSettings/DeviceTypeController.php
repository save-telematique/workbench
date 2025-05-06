<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Requests\GlobalSettings\DeviceTypes\StoreDeviceTypeRequest;
use App\Http\Requests\GlobalSettings\DeviceTypes\UpdateDeviceTypeRequest;
use App\Models\DeviceType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceTypeController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(DeviceType::class, 'device_type');
    }

    /**
     * Display a listing of the device types.
     */
    public function index(): Response
    {
        $deviceTypes = DeviceType::orderBy('name')->get();

        return Inertia::render('global-settings/device-types/index', [
            'deviceTypes' => $deviceTypes,
        ]);
    }

    /**
     * Show the form for creating a new device type.
     */
    public function create(): Response
    {
        return Inertia::render('global-settings/device-types/create');
    }

    /**
     * Store a newly created device type in storage.
     */
    public function store(StoreDeviceTypeRequest $request): RedirectResponse
    {
        DeviceType::create($request->validated());

        return to_route('global-settings.device-types.index')
            ->with('success', 'device_types.created');
    }

    /**
     * Show the form for editing the specified device type.
     */
    public function edit(DeviceType $deviceType): Response
    {
        return Inertia::render('global-settings/device-types/edit', [
            'deviceType' => $deviceType,
        ]);
    }

    /**
     * Update the specified device type in storage.
     */
    public function update(UpdateDeviceTypeRequest $request, DeviceType $deviceType): RedirectResponse
    {
        $deviceType->update($request->validated());

        return to_route('global-settings.device-types.index')
            ->with('success', 'device_types.updated');
    }

    /**
     * Remove the specified device type from storage.
     */
    public function destroy(DeviceType $deviceType): RedirectResponse
    {
        $deviceType->delete();

        return to_route('global-settings.device-types.index')
            ->with('success', 'device_types.deleted');
    }
} 