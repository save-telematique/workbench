<?php

use App\Actions\Users\CreateUserAction;
use App\Actions\Users\DeleteUserAction;
use App\Actions\Users\UpdateUserAction;
use App\Actions\Users\UpdateUserRolesAction;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

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
        require __DIR__ . '/shared/auth.php';

        // Authenticated routes
        Route::middleware(['auth', 'verified'])->group(function () {
            require __DIR__ . '/central/dashboard.php';
            require __DIR__ . '/central/devices.php';
            require __DIR__ . '/central/device-datapoints.php';
            require __DIR__ . '/central/tenants.php';
            require __DIR__ . '/central/global-settings.php';

            require __DIR__ . '/shared/settings.php';
            require __DIR__ . '/shared/vehicles.php';
            require __DIR__ . '/shared/users.php';
            require __DIR__ . '/shared/drivers.php';
        });
    });
}
