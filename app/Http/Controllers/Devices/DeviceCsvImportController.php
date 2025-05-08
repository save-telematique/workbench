<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Http\Controllers\BaseCsvImportTrait;
use App\Services\CsvImportService;
use App\Services\Import\DeviceImporter;

class DeviceCsvImportController extends Controller
{
    use BaseCsvImportTrait;

    public function __construct(CsvImportService $csvImportService, DeviceImporter $deviceImporter)
    {
        $this->csvImportService = $csvImportService;
        $this->importerHandler = $deviceImporter;
    }
} 