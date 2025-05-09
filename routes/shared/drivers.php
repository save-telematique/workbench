<?php

use App\Actions\Drivers\CreateDriverAction;
use App\Actions\Drivers\DeleteDriverAction;
use App\Actions\Drivers\RestoreDriverAction;
use App\Actions\Drivers\ScanDriverDocumentAction;
use App\Actions\Drivers\UpdateDriverAction;
use App\Http\Controllers\Drivers\DriverController;
use App\Http\Controllers\Drivers\DriverCsvImportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Driver Routes
|--------------------------------------------------------------------------
|
| Routes for managing drivers in the central application
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Drivers Import Routes
    Route::get('/drivers/import', [DriverCsvImportController::class, 'create'])->name('drivers.import');
    Route::post('/drivers/import/upload', [DriverCsvImportController::class, 'upload'])->name('drivers.import.upload');
    Route::post('/drivers/import/store', [DriverCsvImportController::class, 'store'])->name('drivers.import.store');
    Route::post('/drivers/import/validate-row', [DriverCsvImportController::class, 'validateRow'])->name('drivers.import.validate-row');
    
    // Driver View Routes (handled by Controller)
    Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::get('/drivers/create', [DriverController::class, 'create'])->name('drivers.create');
    Route::get('/drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
    Route::get('/drivers/{driver}/edit', [DriverController::class, 'edit'])->name('drivers.edit');
    
    // Driver CRUD Routes (handled by Actions)
    Route::post('/drivers', CreateDriverAction::class)->name('drivers.store');
    Route::put('/drivers/{driver}', UpdateDriverAction::class)->name('drivers.update');
    Route::delete('/drivers/{driver}', DeleteDriverAction::class)->name('drivers.destroy');
    Route::put('/drivers/{id}/restore', RestoreDriverAction::class)->name('drivers.restore');
    
    // Driver Utility Routes
    Route::post('/drivers/scan-document', ScanDriverDocumentAction::class)->name('drivers.scan-document');
}); 