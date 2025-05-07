<?php

namespace App\Http\Controllers\Drivers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Drivers\StoreDriverRequest;
use App\Http\Requests\Drivers\UpdateDriverRequest;
use App\Models\Driver;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DriverController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Driver::class, 'driver');
    }

    /**
     * Display a listing of the drivers.
     */
    public function index(Request $request)
    {
        $query = Driver::query()
            ->with(['tenant', 'user'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                return $query->where(function ($q) use ($search) {
                    $q->where('surname', 'like', "%{$search}%")
                      ->orWhere('firstname', 'like', "%{$search}%")
                      ->orWhere('license_number', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('tenant_id') && $request->input('tenant_id') !== 'all', function ($query) use ($request) {
                return $query->where('tenant_id', $request->input('tenant_id'));
            });

        // Get all tenants for the filter
        $tenants = Tenant::select(['id', 'name'])->get();

        // Paginate drivers and transform data
        $drivers = $query->paginate(10)->withQueryString();
        
        $driversData = $drivers->through(function ($driver) {
            return [
                'id' => $driver->id,
                'surname' => $driver->surname,
                'firstname' => $driver->firstname,
                'phone' => $driver->phone,
                'license_number' => $driver->license_number,
                'tenant' => $driver->tenant ? [
                    'id' => $driver->tenant->id,
                    'name' => $driver->tenant->name,
                ] : null,
                'user' => $driver->user ? [
                    'id' => $driver->user->id,
                    'name' => $driver->user->name,
                ] : null,
                'deleted_at' => $driver->deleted_at,
            ];
        });

        return Inertia::render('drivers/index', [
            'drivers' => $driversData,
            'filters' => $request->only(['search', 'tenant_id']),
            'tenants' => $tenants,
        ]);
    }

    /**
     * Show the form for creating a new driver.
     */
    public function create()
    {
        $tenants = Tenant::select('id', 'name')->get();
        $users = User::whereNotNull('tenant_id')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tenant_id' => $user->tenant_id,
            ];
        });

        return Inertia::render('drivers/create', [
            'tenants' => $tenants,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created driver in storage.
     */
    public function store(StoreDriverRequest $request)
    {
        $validatedData = $request->validated();

        // Handle nullable relationships
        if (isset($validatedData['user_id']) && $validatedData['user_id'] === null) {
            $validatedData['user_id'] = null;
        }

        Driver::create($validatedData);

        return to_route('drivers.index');
    }

    /**
     * Display the specified driver.
     */
    public function show(Driver $driver)
    {
        $driver->load(['tenant', 'user']);

        // Get all tenants and users for the select dialogs
        $tenants = Tenant::select(['id', 'name'])->get();
        $users = User::where('tenant_id', $driver->tenant_id)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'tenant_id' => $user->tenant_id,
                ];
            });

        $driverData = [
            'id' => $driver->id,
            'surname' => $driver->surname,
            'firstname' => $driver->firstname,
            'phone' => $driver->phone,
            'license_number' => $driver->license_number,
            'card_issuing_country' => $driver->card_issuing_country,
            'card_number' => $driver->card_number,
            'birthdate' => $driver->birthdate,
            'card_issuing_date' => $driver->card_issuing_date,
            'card_expiration_date' => $driver->card_expiration_date,
            'tenant_id' => $driver->tenant_id,
            'user_id' => $driver->user_id,
            'tenant' => $driver->tenant ? [
                'id' => $driver->tenant->id,
                'name' => $driver->tenant->name,
            ] : null,
            'user' => $driver->user ? [
                'id' => $driver->user->id,
                'name' => $driver->user->name,
                'email' => $driver->user->email,
            ] : null,
            'created_at' => $driver->created_at,
            'updated_at' => $driver->updated_at,
            'deleted_at' => $driver->deleted_at,
        ];

        return Inertia::render('drivers/show', [
            'driver' => $driverData,
            'tenants' => $tenants,
            'users' => $users,
        ]);
    }

    /**
     * Show the form for editing the specified driver.
     */
    public function edit(Driver $driver)
    {
        $driver->load(['tenant', 'user']);
        
        $tenants = Tenant::select('id', 'name')->get();
        $users = User::whereNull('tenant_id')
            ->orWhere('tenant_id', $driver->tenant_id)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'tenant_id' => $user->tenant_id,
                ];
            });

        $driverData = [
            'id' => $driver->id,
            'surname' => $driver->surname,
            'firstname' => $driver->firstname,
            'phone' => $driver->phone,
            'license_number' => $driver->license_number,
            'card_issuing_country' => $driver->card_issuing_country,
            'card_number' => $driver->card_number,
            'birthdate' => $driver->birthdate,
            'card_issuing_date' => $driver->card_issuing_date,
            'card_expiration_date' => $driver->card_expiration_date,
            'tenant_id' => $driver->tenant_id,
            'user_id' => $driver->user_id,
        ];

        return Inertia::render('drivers/edit', [
            'driver' => $driverData,
            'tenants' => $tenants,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified driver in storage.
     */
    public function update(UpdateDriverRequest $request, Driver $driver)
    {
        $validatedData = $request->validated();

        // Handle nullable relationships
        if (isset($validatedData['user_id']) && $validatedData['user_id'] === null) {
            $validatedData['user_id'] = null;
        }

        $driver->update($validatedData);

        return to_route('drivers.show', $driver);
    }

    /**
     * Remove the specified driver from storage.
     */
    public function destroy(Driver $driver)
    {
        $driver->delete();
        
        return to_route('drivers.index');
    }

    /**
     * Restore a soft-deleted driver.
     */
    public function restore($id)
    {
        $driver = Driver::withTrashed()->findOrFail($id);
        $this->authorize('restore', $driver);
        
        $driver->restore();
        
        return to_route('drivers.show', $driver);
    }

    /**
     * Scan driver document and extract driver information.
     */
    public function scanDocument(Request $request, ImageAnalysisService $imageAnalysisService): JsonResponse
    {
        try {
            // Validate the request with detailed error messages
            $validated = $request->validate([
                'file' => [
                    'required',
                    'file',
                    'mimes:jpeg,png,jpg,webp,pdf',
                    'max:10240', // 10MB limit
                ],
            ], [
                'file.required' => __('drivers.scan.error_no_image'),
                'file.file' => __('drivers.scan.error_invalid_format'),
                'file.mimes' => __('drivers.scan.error_invalid_format'),
                'file.max' => __('drivers.scan.error_file_too_large'),
            ]);

            // Use the image analysis service to extract data
            $result = $imageAnalysisService->analyze($request->file('file'), 'driver');
            
            return response()->json($result);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->errors()['file'][0] ?? __('drivers.scan.error'),
            ]);
        } catch (\Exception $e) {
            Log::error('Driver document scanning failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }
} 