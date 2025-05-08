<?php

namespace App\Http\Controllers;

use App\Services\CsvImportService;
use App\Services\Import\ImporterInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

trait BaseCsvImportTrait
{
    /**
     * CSV Import Service instance
     */
    protected CsvImportService $csvImportService;

    /**
     * Importer Handler instance
     */
    protected ImporterInterface $importerHandler;

    /**
     * Show the import form
     */
    public function create()
    {
        $this->authorize($this->importerHandler->getRequiredPermission());

        $tenants = [];
        if (Gate::allows('view_tenants')) {
            $tenants = \App\Models\Tenant::orderBy('name')->get();
        }

        $formData = $this->importerHandler->getFormData();

        return Inertia::render($this->importerHandler->getInertiaPageName(), array_merge([
            'tenants' => $tenants,
        ], $formData));
    }

    /**
     * Process the uploaded CSV file
     */
    public function upload(Request $request)
    {
        $this->authorize($this->importerHandler->getRequiredPermission());

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

        $result = $this->csvImportService->import($request->file('file'), $this->importerHandler);

        return response()->json($result);
    }

    /**
     * Store the imported entities
     */
    public function store(Request $request)
    {
        $this->authorize($this->importerHandler->getRequiredPermission());
        
        $rules = $this->importerHandler->getStoreRequestValidationRules();
        $validator = Validator::make($request->all(), $rules);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $entitiesToImport = $request->input($this->importerHandler->getRequestArrayName());
        $tenantId = $request->input('tenant_id');
        $importedCount = 0;
        $errors = [];
        
        foreach ($entitiesToImport as $index => $entityData) {
            try {
                if ($tenantId && method_exists($this->importerHandler->getModelClass(), 'scopeTenant')) {
                    $entityData['tenant_id'] = $tenantId;
                }
                
                $entity = $this->importerHandler->createEntity($entityData);
                if (method_exists($entity, 'save')) {
                    $entity->save();
                }
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Error importing {$this->importerHandler->getFriendlyName()} at row " . ($index + 1) . ": " . $e->getMessage();
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
        $this->authorize($this->importerHandler->getRequiredPermission());
        
        $validator = Validator::make($request->all(), [
            'row_data' => 'required|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'errors' => $validator->errors()->all(),
                'warnings' => [],
                'field_errors' => []
            ], 422);
        }
        
        $rowData = $request->input('row_data');
        
        $result = $this->csvImportService->validateSingleRow($rowData, $this->importerHandler);
        
        return response()->json($result);
    }
} 