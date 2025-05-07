<?php

namespace App\Http\Controllers\Drivers;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Tenant;
use App\Services\CsvImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DriverCsvImportController extends Controller
{
    protected $csvImportService;

    public function __construct(CsvImportService $csvImportService)
    {
        $this->csvImportService = $csvImportService;
    }

    /**
     * Show the driver import form.
     */
    public function create()
    {
        $this->authorize('create_drivers');
        
        // Get available tenants for the form (only for central users)
        $tenants = [];
        if (Gate::allows('view_tenants')) {
            $tenants = Tenant::orderBy('name')->get();
        }

        return Inertia::render('drivers/import', [
            'tenants' => $tenants,
        ]);
    }

    /**
     * Process the uploaded CSV file.
     */
    public function upload(Request $request)
    {
        $this->authorize('create_drivers');

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

        $result = $this->csvImportService->import($request->file('file'), 'driver');

        return response()->json($result);
    }

    /**
     * Store the imported drivers.
     */
    public function store(Request $request)
    {
        $this->authorize('create_drivers');
        
        $validator = Validator::make($request->all(), [
            'drivers' => 'required|array',
            'drivers.*.first_name' => 'required|string|max:255',
            'drivers.*.last_name' => 'required|string|max:255',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $driversToImport = $request->input('drivers');
        $tenantId = $request->input('tenant_id');
        $importedCount = 0;
        $errors = [];
        
        foreach ($driversToImport as $index => $driverData) {
            try {
                // Force tenant_id if provided
                if ($tenantId) {
                    $driverData['tenant_id'] = $tenantId;
                }
                
                $driver = new Driver($driverData);
                $driver->save();
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Error importing driver at row " . ($index + 1) . ": " . $e->getMessage();
            }
        }
        
        return response()->json([
            'success' => true,
            'imported_count' => $importedCount,
            'errors' => $errors,
        ]);
    }
} 