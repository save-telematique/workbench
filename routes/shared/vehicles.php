<?php

use App\Actions\Vehicles\CreateVehicleAction;
use App\Actions\Vehicles\DeleteVehicleAction;
use App\Actions\Vehicles\GetVehiclesWithLocationsAction;
use App\Actions\Vehicles\UpdateVehicleAction;
use App\Actions\Vehicles\RestoreVehicleAction;
use App\Actions\Vehicles\ScanVehicleRegistrationAction;
use App\Http\Controllers\Vehicles\VehicleController;
use App\Http\Controllers\Vehicles\VehicleActivitiesController;
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
    Route::get('/vehicles/locations', GetVehiclesWithLocationsAction::class)->name('vehicles.locations');
    
    Route::get('/vehicles/import', [VehicleCsvImportController::class, 'create'])->name('vehicles.import');
    Route::post('/vehicles/import/upload', [VehicleCsvImportController::class, 'upload'])->name('vehicles.import.upload');
    Route::post('/vehicles/import/store', [VehicleCsvImportController::class, 'store'])->name('vehicles.import.store');
    Route::post('/vehicles/import/validate-row', [VehicleCsvImportController::class, 'validateRow'])->name('vehicles.import.validate-row');

    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::get('/vehicles/create', [VehicleController::class, 'create'])->name('vehicles.create');

    Route::post('/vehicles', CreateVehicleAction::class)->name('vehicles.store');

    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show'])->name('vehicles.show');
    Route::get('/vehicles/{vehicle}/edit', [VehicleController::class, 'edit'])->name('vehicles.edit');
    Route::get('/vehicles/{vehicle}/activities', [VehicleActivitiesController::class, 'index'])->name('vehicles.activities');

    Route::put('/vehicles/{vehicle}', UpdateVehicleAction::class)->name('vehicles.update');
    Route::delete('/vehicles/{vehicle}', DeleteVehicleAction::class)->name('vehicles.destroy');
    Route::post('/vehicles/{vehicle}/restore', RestoreVehicleAction::class)->name('vehicles.restore')->withTrashed();
    
    Route::post('/vehicles/scan-registration', ScanVehicleRegistrationAction::class)->name('vehicles.scan-registration');
}); 