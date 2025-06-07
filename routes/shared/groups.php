<?php

use App\Actions\Groups\CreateGroupAction;
use App\Actions\Groups\DeleteGroupAction;
use App\Actions\Groups\UpdateGroupAction;
use App\Http\Controllers\Groups\GroupController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Group Routes
|--------------------------------------------------------------------------
|
| Routes for managing groups in both central and tenant applications
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Group View Routes (handled by Controller)
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
    Route::get('/groups/create', [GroupController::class, 'create'])->name('groups.create');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::get('/groups/{group}/edit', [GroupController::class, 'edit'])->name('groups.edit');
    
    // Group CRUD Routes (handled by Actions)
    Route::post('/groups', CreateGroupAction::class)->name('groups.store');
    Route::put('/groups/{group}', UpdateGroupAction::class)->name('groups.update');
    Route::delete('/groups/{group}', DeleteGroupAction::class)->name('groups.destroy');
}); 