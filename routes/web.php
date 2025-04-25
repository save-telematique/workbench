<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        Route::get('/', function () {
            return Inertia::render('welcome');
        })->name('home');
        
        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('dashboard', function () {
                return Inertia::render('dashboard');
            })->name('dashboard');
            
            // Global users routes
            Route::resource('users', \App\Http\Controllers\UsersController::class);
            
            /*
            |--------------------------------------------------------------------------
            | Device Routes
            |--------------------------------------------------------------------------
            */
            Route::resource('devices', \App\Http\Controllers\Devices\DeviceController::class);
            Route::put('devices/{device}/restore', [\App\Http\Controllers\Devices\DeviceController::class, 'restore'])->name('devices.restore');
            Route::delete('devices/{device}/force', [\App\Http\Controllers\Devices\DeviceController::class, 'forceDelete'])->name('devices.force-delete');
            Route::put('devices/{device}/assign-vehicle', [\App\Http\Controllers\Devices\DeviceController::class, 'assignVehicle'])->name('devices.assign-vehicle');
            Route::put('devices/{device}/unassign-vehicle', [\App\Http\Controllers\Devices\DeviceController::class, 'unassignVehicle'])->name('devices.unassign-vehicle');

            // Vehicles Routes
            Route::get('/vehicles', [App\Http\Controllers\Vehicles\VehicleController::class, 'index'])->name('vehicles.index');
            Route::get('/vehicles/create', [App\Http\Controllers\Vehicles\VehicleController::class, 'create'])->name('vehicles.create');
            Route::post('/vehicles', [App\Http\Controllers\Vehicles\VehicleController::class, 'store'])->name('vehicles.store');
            Route::get('/vehicles/{vehicle}', [App\Http\Controllers\Vehicles\VehicleController::class, 'show'])->name('vehicles.show');
            Route::get('/vehicles/{vehicle}/edit', [App\Http\Controllers\Vehicles\VehicleController::class, 'edit'])->name('vehicles.edit');
            Route::put('/vehicles/{vehicle}', [App\Http\Controllers\Vehicles\VehicleController::class, 'update'])->name('vehicles.update');
            Route::delete('/vehicles/{vehicle}', [App\Http\Controllers\Vehicles\VehicleController::class, 'destroy'])->name('vehicles.destroy');
            Route::put('/vehicles/{vehicle}/restore', [App\Http\Controllers\Vehicles\VehicleController::class, 'restore'])->name('vehicles.restore');
        });
        
        require __DIR__.'/settings.php';
        require __DIR__.'/tenants.php';
        require __DIR__.'/auth.php';
        require __DIR__.'/global-settings.php';
    });
}

