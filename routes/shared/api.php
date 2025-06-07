<?php

use App\Actions\Search\GlobalSearchAction;
use App\Actions\VehicleModels\GetModelsByBrandAction;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Unified search endpoint - direct use of the action as controller
Route::middleware(['auth'])->group(function () {
    Route::get('/search', GlobalSearchAction::class)->name('api.search');

    Route::get('vehicle-brands/{vehicleBrand}/models', GetModelsByBrandAction::class)
        ->name('api.vehicle-brands.models');
}); 