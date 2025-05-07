<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;
use App\Http\Controllers\Devices\DeviceController;
use App\Http\Controllers\Devices\DeviceMessageController;
use App\Http\Controllers\Devices\DeviceCsvImportController;
use App\Http\Controllers\Vehicles\VehicleCsvImportController;
use App\Http\Controllers\Drivers\DriverCsvImportController;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group.
|
*/

// Central domain routes
foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        // Public routes
        require __DIR__ . '/central/home.php';
        require __DIR__ . '/auth.php';
        
        // Authenticated routes
        Route::middleware(['auth', 'verified'])->group(function () {
            require __DIR__ . '/central/dashboard.php';
            require __DIR__ . '/central/users.php';
            require __DIR__ . '/central/devices.php';
            require __DIR__ . '/central/vehicles.php';
            require __DIR__ . '/central/drivers.php';
            require __DIR__ . '/settings.php';
            require __DIR__ . '/tenants.php';
            require __DIR__ . '/global-settings.php';
        });
        

    });
}

// Tenant routes are loaded in app/Providers/RouteServiceProvider.php

