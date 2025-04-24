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
        });
        
        require __DIR__.'/settings.php';
        require __DIR__.'/tenants.php';
        require __DIR__.'/auth.php';
        require __DIR__.'/global-settings.php';
    });
}

