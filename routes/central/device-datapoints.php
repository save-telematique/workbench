<?php

use App\Actions\DataPoints\GetDeviceDataPointsAction;
use App\Http\Controllers\Devices\DataPointController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Device DataPoints Routes
|--------------------------------------------------------------------------
|
| Routes for managing device data points in the central application
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // DataPoints display route
    Route::get('/devices/{device}/datapoints', [DataPointController::class, 'index'])->name('devices.datapoints.index');
    
    // DataPoints API routes
    Route::get('/api/devices/datapoints', GetDeviceDataPointsAction::class)->name('api.devices.datapoints');
}); 