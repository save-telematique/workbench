<?php

use App\Actions\Alerts\GetAlertsAction;
use App\Actions\Alerts\GetUnreadAlertsCountAction;
use App\Actions\Alerts\MarkAlertAsReadAction;
use App\Actions\Alerts\MarkAlertAsUnreadAction;
use App\Http\Controllers\AlertController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Alert Routes
|--------------------------------------------------------------------------
|
| Routes for managing alerts in both central and tenant applications
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Alert viewing routes (no manual creation allowed)
    Route::get('/alerts', [AlertController::class, 'index'])->name('alerts.index');
    Route::get('/alerts/{alert}', [AlertController::class, 'show'])->name('alerts.show');
    
    // Alert status actions
    Route::post('/alerts/{alert}/mark-as-read', MarkAlertAsReadAction::class)->name('alerts.mark-as-read');
    Route::post('/alerts/{alert}/mark-as-unread', MarkAlertAsUnreadAction::class)->name('alerts.mark-as-unread');
    
    // API endpoints for widgets and dropdowns
    Route::get('/api/alerts/recent', [AlertController::class, 'recent'])->name('api.alerts.recent');
    Route::get('/api/alerts/for-entity/{type}/{id}', [AlertController::class, 'forEntity'])->name('api.alerts.for-entity');
    Route::get('/api/alerts/unread-count', GetUnreadAlertsCountAction::class)->name('api.alerts.unread-count');
    
    // API endpoint for getting alerts with optional entity filtering
    Route::get('/api/alerts', GetAlertsAction::class)->name('api.alerts.index');
}); 