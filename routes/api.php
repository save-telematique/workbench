<?php

use App\Actions\Users\CreateUserAction;
use App\Actions\Users\DeleteUserAction;
use App\Actions\Users\UpdateUserAction;
use App\Actions\Users\UpdateUserRolesAction;
use App\Http\Controllers\Devices\DeviceEdgeController;
use App\Http\Controllers\Devices\DeviceMessageController;
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
        Route::prefix('messages')->group(function () {
            Route::post('/', [DeviceEdgeController::class, 'store'])->name('messages.store');
            Route::get('/', [DeviceEdgeController::class, 'index'])->name('messages.index');
        });
    });
}
