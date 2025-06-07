<?php

use App\Actions\Geofences\CreateGeofenceAction;
use App\Actions\Geofences\DeleteGeofenceAction;
use App\Actions\Geofences\UpdateGeofenceAction;
use App\Http\Controllers\GeofenceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Geofence Routes
|--------------------------------------------------------------------------
|
| Routes for managing geofences in the application
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/geofences', [GeofenceController::class, 'index'])->name('geofences.index');
    Route::get('/geofences/create', [GeofenceController::class, 'create'])->name('geofences.create');

    Route::post('/geofences', CreateGeofenceAction::class)->name('geofences.store');

    Route::get('/geofences/{geofence}', [GeofenceController::class, 'show'])->name('geofences.show');
    Route::get('/geofences/{geofence}/edit', [GeofenceController::class, 'edit'])->name('geofences.edit');

    Route::put('/geofences/{geofence}', UpdateGeofenceAction::class)->name('geofences.update');
    Route::delete('/geofences/{geofence}', DeleteGeofenceAction::class)->name('geofences.destroy');
}); 