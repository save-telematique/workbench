<?php

use App\Actions\Users\CreateUserAction;
use App\Actions\Users\DeleteUserAction;
use App\Actions\Users\UpdateUserAction;
use App\Actions\Users\UpdateUserRolesAction;
use App\Http\Controllers\Devices\DataPointController;
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
            require __DIR__ . '/central/drivers.php';
            require __DIR__ . '/central/tenants.php';
            
            require __DIR__ . '/global-settings.php';
            require __DIR__ . '/shared/settings.php';
            require __DIR__ . '/shared/vehicles.php';

            Route::get('/devices/{device}/datapoints', [DataPointController::class, 'index'])->name('devices.datapoints.index');
            Route::get('/api/devices/datapoints', [DataPointController::class, 'getDataPoints'])->name('api.devices.datapoints');

            // Users display routes
            Route::get('/users', [UserController::class, 'index'])->name('users.index');
            Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
            Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
            Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
            Route::get('/users/{user}/roles', [UserController::class, 'editRoles'])->name('users.roles.edit');
            
            // Users action routes
            Route::post('/users', CreateUserAction::class)->name('users.store');
            Route::put('/users/{user}', UpdateUserAction::class)->name('users.update');
            Route::delete('/users/{user}', DeleteUserAction::class)->name('users.destroy');
            Route::put('/users/{user}/roles', UpdateUserRolesAction::class)->name('users.roles.update');
        });
    });
}
