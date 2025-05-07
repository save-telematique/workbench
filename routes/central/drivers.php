<?php

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
    
    // Driver CRUD Routes
    Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::get('/drivers/create', [DriverController::class, 'create'])->name('drivers.create');
    Route::post('/drivers', [DriverController::class, 'store'])->name('drivers.store');
    Route::get('/drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
    Route::get('/drivers/{driver}/edit', [DriverController::class, 'edit'])->name('drivers.edit');
    Route::put('/drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update');
    Route::delete('/drivers/{driver}', [DriverController::class, 'destroy'])->name('drivers.destroy');
    Route::put('/drivers/{driver}/restore', [DriverController::class, 'restore'])->name('drivers.restore');
    
    // Driver Utility Routes
    Route::post('/drivers/scan-document', [DriverController::class, 'scanDocument'])->name('drivers.scan-document');
}); 