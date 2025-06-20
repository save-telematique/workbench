<?php 

use App\Actions\Users\CreateUserAction;
use App\Actions\Users\DeleteUserAction;
use App\Actions\Users\SendPasswordResetLinkAction;
use App\Actions\Users\UpdateUserAction;
use App\Actions\Users\UpdateUserRolesAction;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::get('/users/{user}/roles', [UserController::class, 'editRoles'])->name('users.roles.edit');
    
    Route::post('/users', CreateUserAction::class)->name('users.store');
    Route::put('/users/{user}', UpdateUserAction::class)->name('users.update');
    Route::delete('/users/{user}', DeleteUserAction::class)->name('users.destroy');
    Route::put('/users/{user}/roles', UpdateUserRolesAction::class)->name('users.roles.update');
    Route::post('/users/{user}/send-password-reset', SendPasswordResetLinkAction::class)->name('users.send-password-reset');
});
