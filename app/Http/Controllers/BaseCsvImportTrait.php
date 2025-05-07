<?php

namespace App\Http\Controllers;

use App\Services\CsvImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

trait BaseCsvImportTrait
{
    /**
     * CSV Import Service instance
     */
    protected $csvImportService;

    /**
     * Return import configuration specific to the entity
     */
    abstract protected function getImportConfig(): array;

    /**
     * Return additional data for the import form
     */
    abstract protected function getImportFormData(): array;

    /**
     * Return the entity for import
     */
    abstract protected function createEntityFromImportData(array $entityData): object;

    /**
     * Show the import form
     */
    public function create()
    {
        $config = $this->getImportConfig();
        $this->authorize($config['permission']);

        // Get available tenants for the form (only for central users)
        $tenants = [];
        if (Gate::allows('view_tenants')) {
            $tenants = \App\Models\Tenant::orderBy('name')->get();
        }

        // Get additional data specific to this entity type
        $formData = $this->getImportFormData();

        return Inertia::render($config['inertia_page'], array_merge([
            'tenants' => $tenants,
        ], $formData));
    }

    /**
     * Process the uploaded CSV file
     */
    public function upload(Request $request)
    {
        $config = $this->getImportConfig();
        $this->authorize($config['permission']);

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

        $result = $this->csvImportService->import($request->file('file'), $config['type']);

        return response()->json($result);
    }

    /**
     * Store the imported entities
     */
    public function store(Request $request)
    {
        $config = $this->getImportConfig();
        $this->authorize($config['permission']);
        
        $validator = Validator::make($request->all(), [
            $config['request_array_name'] => 'required|array',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $entitiesToImport = $request->input($config['request_array_name']);
        $tenantId = $request->input('tenant_id');
        $importedCount = 0;
        $errors = [];
        
        foreach ($entitiesToImport as $index => $entityData) {
            try {
                // Force tenant_id if provided
                if ($tenantId) {
                    $entityData['tenant_id'] = $tenantId;
                }
                
                $entity = $this->createEntityFromImportData($entityData);
                $entity->save();
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Error importing {$config['type']} at row " . ($index + 1) . ": " . $e->getMessage();
            }
        }
        
        return response()->json([
            'success' => true,
            'imported_count' => $importedCount,
            'errors' => $errors,
        ]);
    }

    /**
     * Validate a single row
     */
    public function validateRow(Request $request)
    {
        $config = $this->getImportConfig();
        $this->authorize($config['permission']);
        
        $validator = Validator::make($request->all(), [
            'row_data' => 'required|array',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'errors' => $validator->errors()->all(),
                'warnings' => [],
            ], 422);
        }
        
        $rowData = $request->input('row_data');
        
        // Validate the row using the CsvImportService
        $result = $this->csvImportService->validateSingleRow($rowData, $config['type']);
        
        return response()->json($result);
    }
} 