<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Devices\DataPointController;

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

            Route::get('/devices/{device}/datapoints', [DataPointController::class, 'index'])->name('devices.datapoints.index');
            Route::get('/api/devices/datapoints', [DataPointController::class, 'getDataPoints'])->name('api.devices.datapoints');
        });
    });
}

// Tenant routes are loaded in app/Providers/RouteServiceProvider.php

// Add the datapoints routes to make them available in both contexts
