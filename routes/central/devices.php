<?php

use App\Actions\Devices\AssignVehicleAction;
use App\Actions\Devices\CreateDeviceAction;
use App\Actions\Devices\DeleteDeviceAction;
use App\Actions\Devices\ForceDeleteDeviceAction;
use App\Actions\Devices\RestoreDeviceAction;
use App\Actions\Devices\ScanQrCodeAction;
use App\Actions\Devices\UnassignVehicleAction;
use App\Actions\Devices\UpdateDeviceAction;
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
    Route::post('devices/scan-qr-code', ScanQrCodeAction::class)->name('devices.scan-qr-code');
    
    // Display routes (index, create, show, edit)
    Route::get('devices', [DeviceController::class, 'index'])->name('devices.index');
    Route::get('devices/create', [DeviceController::class, 'create'])->name('devices.create');
    Route::get('devices/{device}', [DeviceController::class, 'show'])->name('devices.show');
    Route::get('devices/{device}/edit', [DeviceController::class, 'edit'])->name('devices.edit');
    
    // Action routes
    Route::post('devices', CreateDeviceAction::class)->name('devices.store');
    Route::put('devices/{device}', UpdateDeviceAction::class)->name('devices.update');
    Route::delete('devices/{device}', DeleteDeviceAction::class)->name('devices.destroy');
    Route::put('devices/{device}/assign-vehicle/{vehicle}', AssignVehicleAction::class)->name('devices.assign-vehicle');
    Route::put('devices/{device}/unassign-vehicle', UnassignVehicleAction::class)->name('devices.unassign-vehicle');
    
    // Device Message Routes
    Route::get('devices/{device}/messages', [DeviceMessageController::class, 'index'])->name('devices.messages.index');
}); 