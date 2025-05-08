<?php

namespace App\Http\Controllers\Vehicles;

use App\Http\Controllers\Controller;
use App\Http\Controllers\BaseCsvImportTrait;
use App\Services\CsvImportService;
use App\Services\Import\VehicleImporter;

class VehicleCsvImportController extends Controller
{
    use BaseCsvImportTrait;

    public function __construct(CsvImportService $csvImportService, VehicleImporter $vehicleImporter)
    {
        $this->csvImportService = $csvImportService;
        $this->importerHandler = $vehicleImporter;
    }
} 