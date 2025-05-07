<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\DeviceType;
use App\Models\Tenant;
use App\Services\CsvImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DeviceCsvImportController extends Controller
{
    protected $csvImportService;

    public function __construct(CsvImportService $csvImportService)
    {
        $this->csvImportService = $csvImportService;
    }

    /**
     * Show the device import form.
     */
    public function create()
    {
        $this->authorize('create_devices');

        // Get available device types for the form
        $deviceTypes = DeviceType::orderBy('name')->get();
        
        // Get available tenants for the form (only for central users)
        $tenants = [];
        if (Gate::allows('view_tenants')) {
            $tenants = Tenant::orderBy('name')->get();
        }

        return Inertia::render('devices/import', [
            'deviceTypes' => $deviceTypes,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Process the uploaded CSV file.
     */
    public function upload(Request $request)
    {
        $this->authorize('create_devices');

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

        $result = $this->csvImportService->import($request->file('file'), 'device');

        return response()->json($result);
    }

    /**
     * Store the imported devices.
     */
    public function store(Request $request)
    {
        $this->authorize('create_devices');
        
        $validator = Validator::make($request->all(), [
            'devices' => 'required|array',
            'devices.*.serial_number' => 'required|string|max:255',
            'devices.*.device_type_id' => 'required|exists:device_types,id',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $devicesToImport = $request->input('devices');
        $tenantId = $request->input('tenant_id');
        $importedCount = 0;
        $errors = [];
        
        foreach ($devicesToImport as $index => $deviceData) {
            try {
                // Force tenant_id if provided
                if ($tenantId) {
                    $deviceData['tenant_id'] = $tenantId;
                }
                
                $device = new Device($deviceData);
                $device->save();
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Error importing device at row " . ($index + 1) . ": " . $e->getMessage();
            }
        }
        
        return response()->json([
            'success' => true,
            'imported_count' => $importedCount,
            'errors' => $errors,
        ]);
    }
} 