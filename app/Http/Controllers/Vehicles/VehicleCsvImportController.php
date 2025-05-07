<?php

namespace App\Http\Controllers\Vehicles;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\Tenant;
use App\Services\CsvImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class VehicleCsvImportController extends Controller
{
    protected $csvImportService;

    public function __construct(CsvImportService $csvImportService)
    {
        $this->csvImportService = $csvImportService;
    }

    /**
     * Show the vehicle import form.
     */
    public function create()
    {
        //$this->authorize('create_vehicles');

        // Get available vehicle types for the form
        $vehicleTypes = VehicleType::orderBy('name')->get();
        
        // Get available vehicle brands with their models
        $vehicleBrands = VehicleBrand::with('models')->orderBy('name')->get();
        
        // Get available tenants for the form (only for central users)
        $tenants = [];
        if (Gate::allows('view_tenants')) {
            $tenants = Tenant::orderBy('name')->get();
        }

        return Inertia::render('vehicles/import', [
            'vehicleTypes' => $vehicleTypes,
            'vehicleBrands' => $vehicleBrands,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Process the uploaded CSV file.
     */
    public function upload(Request $request)
    {
        $this->authorize('create_vehicles');

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240', // 10MB max
        ], [
            'file.mimes' => __('common.csv_import.invalid_file_format'),
            'file.max' => __('common.csv_import.file_too_large'),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $result = $this->csvImportService->import($request->file('file'), 'vehicle');

        return response()->json($result);
    }

    /**
     * Store the imported vehicles.
     */
    public function store(Request $request)
    {
        $this->authorize('create_vehicles');
        
        $validator = Validator::make($request->all(), [
            'vehicles' => 'required|array',
            'vehicles.*.registration' => 'required|string|max:255',
            'vehicles.*.vehicle_type_id' => 'required|exists:vehicle_types,id',
            'vehicles.*.vehicle_brand_id' => 'required|exists:vehicle_brands,id',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $vehiclesToImport = $request->input('vehicles');
        $tenantId = $request->input('tenant_id');
        $importedCount = 0;
        $errors = [];
        
        foreach ($vehiclesToImport as $index => $vehicleData) {
            try {
                // Force tenant_id if provided
                if ($tenantId) {
                    $vehicleData['tenant_id'] = $tenantId;
                }
                
                $vehicle = new Vehicle($vehicleData);
                $vehicle->save();
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Error importing vehicle at row " . ($index + 1) . ": " . $e->getMessage();
            }
        }
        
        return response()->json([
            'success' => true,
            'imported_count' => $importedCount,
            'errors' => $errors,
        ]);
    }
} 