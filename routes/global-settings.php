<?php

use App\Http\Controllers\GlobalSettings\DeviceTypeController;
use App\Http\Controllers\GlobalSettings\VehicleTypeController;
use App\Http\Controllers\GlobalSettings\VehicleBrandController;
use App\Http\Controllers\GlobalSettings\VehicleModelController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('global-settings')->name('global-settings.')->group(function () {
    Route::resource('device-types', DeviceTypeController::class);
    Route::resource('vehicle-types', VehicleTypeController::class);
    Route::resource('vehicle-brands', VehicleBrandController::class);
    Route::resource('vehicle-models', VehicleModelController::class);
    
    // Route pour obtenir les modèles par marque
    Route::get('vehicle-brands/{vehicleBrand}/models', [VehicleModelController::class, 'getByBrand'])
        ->name('vehicle-brands.models');

    Route::get('/', function () {
        return redirect()->route('global-settings.device-types.index');
    });
}); 