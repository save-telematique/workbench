<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
|
| Routes for managing users in the central application
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Global users routes
    Route::resource('users', UsersController::class);
    Route::get('users/{user}/roles', [UsersController::class, 'editRoles'])->name('users.roles.edit');
    Route::put('users/{user}/roles', [UsersController::class, 'updateRoles'])->name('users.roles.update');
}); 