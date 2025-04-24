<?php

use App\Http\Controllers\GlobalSettings\DeviceTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('global-settings')->name('global-settings.')->group(function () {
    Route::resource('device-types', DeviceTypeController::class);

    Route::get('/', function () {
        return redirect()->route('global-settings.device-types.index');
    });
}); 