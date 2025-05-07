<?php

use App\Http\Controllers\Vehicles\VehicleController;
use App\Http\Controllers\Vehicles\VehicleCsvImportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Vehicle Routes
|--------------------------------------------------------------------------
|
| Routes for managing vehicles in the central application
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Vehicles Import Routes
    Route::get('/vehicles/import', [VehicleCsvImportController::class, 'create'])->name('vehicles.import');
    Route::post('/vehicles/import/upload', [VehicleCsvImportController::class, 'upload'])->name('vehicles.import.upload');
    Route::post('/vehicles/import/store', [VehicleCsvImportController::class, 'store'])->name('vehicles.import.store');
    Route::post('/vehicles/import/validate-row', [VehicleCsvImportController::class, 'validateRow'])->name('vehicles.import.validate-row');

    // Vehicle CRUD Routes
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::get('/vehicles/create', [VehicleController::class, 'create'])->name('vehicles.create');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show'])->name('vehicles.show');
    Route::get('/vehicles/{vehicle}/edit', [VehicleController::class, 'edit'])->name('vehicles.edit');
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    Route::put('/vehicles/{vehicle}/restore', [VehicleController::class, 'restore'])->name('vehicles.restore');
    
    // Vehicle Utility Routes
    Route::post('/vehicles/scan-registration', [VehicleController::class, 'scanRegistration'])->name('vehicles.scan-registration');
}); 