<?php

namespace App\Http\Controllers\GlobalSettings;

use App\Http\Controllers\Controller;
use App\Http\Resources\Devices\DeviceTypeResource;
use App\Models\DeviceType;
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
            'deviceTypes' => DeviceTypeResource::collection($deviceTypes),
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
     * Show the form for editing the specified device type.
     */
    public function edit(DeviceType $deviceType): Response
    {
        return Inertia::render('global-settings/device-types/edit', [
            'deviceType' => new DeviceTypeResource($deviceType),
        ]);
    }
} 