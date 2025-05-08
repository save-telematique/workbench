<?php

namespace App\Http\Controllers\Drivers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\BaseCsvImportTrait;
use App\Services\CsvImportService;
use App\Services\Import\DriverImporter;

class DriverCsvImportController extends Controller
{
    use BaseCsvImportTrait;

    public function __construct(CsvImportService $csvImportService, DriverImporter $driverImporter)
    {
        $this->csvImportService = $csvImportService;
        $this->importerHandler = $driverImporter;
    }

    // All specific action methods (create, upload, store, validateRow)
    // and config-related protected methods (getImportConfig, getImportFormData, createEntityFromImportData)
    // are removed as they are now handled by BaseCsvImportTrait and the DriverImporter via $this->importerHandler.
} 