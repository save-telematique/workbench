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

    Route::get('/', function () {
        return redirect()->route('global-settings.device-types.index');
    });
}); 