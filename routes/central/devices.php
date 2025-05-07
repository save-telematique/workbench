<?php

use App\Http\Controllers\Devices\DeviceController;
use App\Http\Controllers\Devices\DeviceMessageController;
use App\Http\Controllers\Devices\DeviceCsvImportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Device Routes
|--------------------------------------------------------------------------
|
| Routes for managing devices in the central application
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Device Import Routes (specific routes before resource routes)
    Route::get('devices/import', [DeviceCsvImportController::class, 'create'])->name('devices.import');
    Route::post('devices/import/upload', [DeviceCsvImportController::class, 'upload'])->name('devices.import.upload');
    Route::post('devices/import/store', [DeviceCsvImportController::class, 'store'])->name('devices.import.store');
    Route::post('devices/import/validate-row', [DeviceCsvImportController::class, 'validateRow'])->name('devices.import.validate-row');
    
    // QR Code Scanning
    Route::post('devices/scan-qr-code', [DeviceController::class, 'scanQrCode'])->name('devices.scan-qr-code');
    
    // Device Basic CRUD Routes
    Route::resource('devices', DeviceController::class);
    
    // Device Additional Actions
    Route::put('devices/{device}/restore', [DeviceController::class, 'restore'])->name('devices.restore');
    Route::delete('devices/{device}/force', [DeviceController::class, 'forceDelete'])->name('devices.force-delete');
    Route::put('devices/{device}/assign-vehicle', [DeviceController::class, 'assignVehicle'])->name('devices.assign-vehicle');
    Route::put('devices/{device}/unassign-vehicle', [DeviceController::class, 'unassignVehicle'])->name('devices.unassign-vehicle');
    
    // Device Message Routes
    Route::get('devices/{device}/messages', [DeviceMessageController::class, 'index'])->name('devices.messages.index');
}); 