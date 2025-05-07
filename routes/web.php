<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;
use App\Http\Controllers\Devices\DeviceController;
use App\Http\Controllers\Devices\DeviceMessageController;

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
            Route::get('users/{user}/roles', [\App\Http\Controllers\UsersController::class, 'editRoles'])->name('users.roles.edit');
            Route::put('users/{user}/roles', [\App\Http\Controllers\UsersController::class, 'updateRoles'])->name('users.roles.update');
            
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
            Route::post('/vehicles/scan-registration', [App\Http\Controllers\Vehicles\VehicleController::class, 'scanRegistration'])->name('vehicles.scan-registration');

            // Driver Routes
            Route::get('/drivers', [App\Http\Controllers\Drivers\DriverController::class, 'index'])->name('drivers.index');
            Route::get('/drivers/create', [App\Http\Controllers\Drivers\DriverController::class, 'create'])->name('drivers.create');
            Route::post('/drivers', [App\Http\Controllers\Drivers\DriverController::class, 'store'])->name('drivers.store');
            Route::get('/drivers/{driver}', [App\Http\Controllers\Drivers\DriverController::class, 'show'])->name('drivers.show');
            Route::get('/drivers/{driver}/edit', [App\Http\Controllers\Drivers\DriverController::class, 'edit'])->name('drivers.edit');
            Route::put('/drivers/{driver}', [App\Http\Controllers\Drivers\DriverController::class, 'update'])->name('drivers.update');
            Route::delete('/drivers/{driver}', [App\Http\Controllers\Drivers\DriverController::class, 'destroy'])->name('drivers.destroy');
            Route::put('/drivers/{driver}/restore', [App\Http\Controllers\Drivers\DriverController::class, 'restore'])->name('drivers.restore');
            Route::post('/drivers/scan-document', [App\Http\Controllers\Drivers\DriverController::class, 'scanDocument'])->name('drivers.scan-document');

            // Devices routes
            Route::prefix('devices')->name('devices.')->middleware(['auth', 'verified'])->group(function () {
                Route::get('/', [DeviceController::class, 'index'])->name('index');
                Route::get('/create', [DeviceController::class, 'create'])->name('create');
                Route::post('/', [DeviceController::class, 'store'])->name('store');
                Route::get('/{device}', [DeviceController::class, 'show'])->name('show');
                Route::get('/{device}/edit', [DeviceController::class, 'edit'])->name('edit');
                Route::put('/{device}', [DeviceController::class, 'update'])->name('update');
                Route::delete('/{device}', [DeviceController::class, 'destroy'])->name('destroy');
                
                // QR code scanning
                Route::post('/scan-qr-code', [DeviceController::class, 'scanQrCode'])->name('scan-qr-code');
                
                // Device messages routes
                Route::get('/{device}/messages', [DeviceMessageController::class, 'index'])->name('messages.index');
            });
        });
        
        require __DIR__.'/settings.php';
        require __DIR__.'/tenants.php';
        require __DIR__.'/auth.php';
        require __DIR__.'/global-settings.php';
    });
}

