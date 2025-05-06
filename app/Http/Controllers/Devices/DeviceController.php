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
    public function scanQrCode(Request $request): JsonResponse
    {
        // Désactiver vérification CSRF pour cet endpoint API spécifique si nécessaire
        // Ce n'est pas recommandé en production mais peut être utile pour le débogage
        // $this->middleware('csrf')->except('scanQrCode');
        
        $result = [
            'success' => false,
            'data' => null,
            'error' => null,
        ];

        try {
            // Validate the request with detailed error messages
            $validated = $request->validate([
                'image' => [
                    'required',
                    'image',
                    'mimes:jpeg,png,jpg,webp',
                    'max:10240', // 10MB limit
                ],
            ], [
                'image.required' => __('devices.scan.error_no_image'),
                'image.image' => __('devices.scan.error_invalid_format'),
                'image.mimes' => __('devices.scan.error_invalid_format'),
                'image.max' => __('devices.scan.error_file_too_large'),
            ]);

            // Store the uploaded image temporarily
            $imagePath = $request->file('image')->store('temp/device-scans', 'public');
            $fullImagePath = Storage::disk('public')->path($imagePath);

            if (!file_exists($fullImagePath) || !is_readable($fullImagePath)) {
                throw new \Exception(__('devices.scan.error_reading_file'));
            }

            // Get base64 encoded image content
            $imageData = base64_encode(file_get_contents($fullImagePath));

            if (empty($imageData)) {
                throw new \Exception(__('devices.scan.error_empty_image'));
            }

            $client = OpenAI::client(config('openai.api_key'));
            
            $response = $client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an assistant that extracts information from images of telematics devices. 
                        Look for QR codes, barcodes, plain text and device model information on the device. 
                        Extract exactly these fields if visible: IMEI, serial number (SN), firmware version, and most importantly, the device type/model.
                        The device model/type can only be one of the following: ' . DeviceType::all()->pluck('name')->implode(', ') . 'if none is matching return null.
                        Return ONLY a JSON object with these fields: imei, serial_number, firmware_version, and device_type (this is crucial).'
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Analyze this image of a telematics device and extract all relevant information. 
                                Pay special attention to QR codes, the IMEI number, serial number, and the device model/type.
                                Return the data in JSON format.'
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:image/jpeg;base64,{$imageData}"
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            // Parse the AI response
            $content = $response->choices[0]->message->content;
            
            // Try to extract JSON from the response
            if (preg_match('/```json(.*?)```/s', $content, $matches)) {
                $jsonString = $matches[1];
            } else {
                $jsonString = $content;
            }
            
            // Clean and decode the JSON
            $jsonString = preg_replace('/```(json)?|```/', '', $jsonString);
            $deviceData = json_decode($jsonString, true);
            
            if (!$deviceData || json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Failed to parse AI response: " . json_last_error_msg());
            }

            // Validate the extracted data
            if (empty($deviceData['imei']) && empty($deviceData['serial_number']) && empty($deviceData['device_type'])) {
                throw new \Exception(__('devices.scan.error_no_data_extracted'));
            }

            // Clean up temporary storage
            Storage::disk('public')->delete($imagePath);

            $result = [
                'success' => true,
                'data' => $deviceData,
                'error' => null,
            ];
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            $result = [
                'success' => false,
                'data' => null,
                'error' => $e->errors()['image'][0] ?? __('devices.scan.error'),
            ];
        } catch (\Exception $e) {
            $result = [
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }

        return response()->json($result);
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