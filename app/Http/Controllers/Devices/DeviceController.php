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
use App\Services\ImageAnalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use OpenAI;

class DeviceController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Device::class, 'device');
    }

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
        $vehicles = Vehicle::all();

        return Inertia::render('devices/index', [
            'devices' => $devices,
            'filters' => $request->only(['search', 'trashed', 'tenant_id', 'device_type_id', 'vehicle_id']),
            'deviceTypes' => $deviceTypes,
            'tenants' => $tenants,
            'vehicles' => $vehicles,
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
     * Scan QR code from image and extract device information.
     */
    public function scanQrCode(Request $request, ImageAnalysisService $imageAnalysisService): JsonResponse
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'file' => [
                    'required',
                    'file',
                    'mimes:jpeg,png,jpg,webp,pdf',
                    'max:10240', // 10MB limit
                ],
            ], [
                'file.required' => __('devices.scan.error_no_image'),
                'file.file' => __('devices.scan.error_invalid_format'),
                'file.mimes' => __('devices.scan.error_invalid_format'),
                'file.max' => __('devices.scan.error_file_too_large'),
            ]);

            // Use the image analysis service to extract data
            $result = $imageAnalysisService->analyze($request->file('file'), 'device');

            if ($result['success'] && !empty($result['data'])) {
                // Find the device type ID based on the type name
                $deviceTypeName = $result['data']['device_type'] ?? null;
                if ($deviceTypeName) {
                    $deviceType = DeviceType::where('name', 'like', "%{$deviceTypeName}%")->first();
                    if ($deviceType) {
                        $result['data']['device_type_id'] = $deviceType->id;
                    }
                }
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('QR code scanning failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display the specified device.
     */
    public function show(Device $device): Response
    {
        // Load all the necessary relationships and ensure last_contact_at is included
        // which will allow the is_online accessor to work properly
        $device->load([
            'type', 
            'vehicle.tenant', 
            'vehicle.model.vehicleBrand', 
            'tenant'
        ]);

        // Include all device types for the edit form
        $deviceTypes = DeviceType::all();

        return Inertia::render('devices/show', [
            'device' => $device,
            'deviceTypes' => $deviceTypes,
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

} 