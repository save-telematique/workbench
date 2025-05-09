<?php

use App\Actions\DeviceTypes\CreateDeviceTypeAction;
use App\Actions\DeviceTypes\UpdateDeviceTypeAction;
use App\Actions\DeviceTypes\DeleteDeviceTypeAction;
use App\Actions\VehicleTypes\CreateVehicleTypeAction;
use App\Actions\VehicleTypes\UpdateVehicleTypeAction;
use App\Actions\VehicleTypes\DeleteVehicleTypeAction;
use App\Actions\VehicleBrands\CreateVehicleBrandAction;
use App\Actions\VehicleBrands\UpdateVehicleBrandAction;
use App\Actions\VehicleBrands\DeleteVehicleBrandAction;
use App\Actions\VehicleModels\CreateVehicleModelAction;
use App\Actions\VehicleModels\UpdateVehicleModelAction;
use App\Actions\VehicleModels\DeleteVehicleModelAction;
use App\Actions\VehicleModels\GetModelsByBrandAction;
use App\Http\Controllers\GlobalSettings\DeviceTypeController;
use App\Http\Controllers\GlobalSettings\VehicleTypeController;
use App\Http\Controllers\GlobalSettings\VehicleBrandController;
use App\Http\Controllers\GlobalSettings\VehicleModelController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('global-settings')->name('global-settings.')->group(function () {
    // Device Types
    Route::get('/device-types', [DeviceTypeController::class, 'index'])->name('device-types.index');
    Route::get('/device-types/create', [DeviceTypeController::class, 'create'])->name('device-types.create');
    Route::get('/device-types/{device_type}/edit', [DeviceTypeController::class, 'edit'])->name('device-types.edit');
    Route::post('/device-types', CreateDeviceTypeAction::class)->name('device-types.store');
    Route::put('/device-types/{device_type}', UpdateDeviceTypeAction::class)->name('device-types.update');
    Route::delete('/device-types/{device_type}', DeleteDeviceTypeAction::class)->name('device-types.destroy');
    
    // Vehicle Types
    Route::get('/vehicle-types', [VehicleTypeController::class, 'index'])->name('vehicle-types.index');
    Route::get('/vehicle-types/create', [VehicleTypeController::class, 'create'])->name('vehicle-types.create');
    Route::get('/vehicle-types/{vehicle_type}/edit', [VehicleTypeController::class, 'edit'])->name('vehicle-types.edit');
    Route::post('/vehicle-types', CreateVehicleTypeAction::class)->name('vehicle-types.store');
    Route::put('/vehicle-types/{vehicle_type}', UpdateVehicleTypeAction::class)->name('vehicle-types.update');
    Route::delete('/vehicle-types/{vehicle_type}', DeleteVehicleTypeAction::class)->name('vehicle-types.destroy');
    
    // Vehicle Brands
    Route::get('/vehicle-brands', [VehicleBrandController::class, 'index'])->name('vehicle-brands.index');
    Route::get('/vehicle-brands/create', [VehicleBrandController::class, 'create'])->name('vehicle-brands.create');
    Route::get('/vehicle-brands/{vehicle_brand}/edit', [VehicleBrandController::class, 'edit'])->name('vehicle-brands.edit');
    Route::post('/vehicle-brands', CreateVehicleBrandAction::class)->name('vehicle-brands.store');
    Route::put('/vehicle-brands/{vehicle_brand}', UpdateVehicleBrandAction::class)->name('vehicle-brands.update');
    Route::delete('/vehicle-brands/{vehicle_brand}', DeleteVehicleBrandAction::class)->name('vehicle-brands.destroy');
    
    // Vehicle Models
    Route::get('/vehicle-models', [VehicleModelController::class, 'index'])->name('vehicle-models.index');
    Route::get('/vehicle-models/create', [VehicleModelController::class, 'create'])->name('vehicle-models.create');
    Route::get('/vehicle-models/{vehicle_model}/edit', [VehicleModelController::class, 'edit'])->name('vehicle-models.edit');
    Route::post('/vehicle-models', CreateVehicleModelAction::class)->name('vehicle-models.store');
    Route::put('/vehicle-models/{vehicle_model}', UpdateVehicleModelAction::class)->name('vehicle-models.update');
    Route::delete('/vehicle-models/{vehicle_model}', DeleteVehicleModelAction::class)->name('vehicle-models.destroy');
    
    // API Routes
    Route::get('vehicle-brands/{vehicleBrand}/models', GetModelsByBrandAction::class)
        ->name('vehicle-brands.models');

    // Default route
    Route::get('/', function () {
        return redirect()->route('global-settings.device-types.index');
    });
}); 