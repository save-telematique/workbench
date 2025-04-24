<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        Route::get('/', function () {
            return Inertia::render('welcome');
        })->name('home');
        
        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('dashboard', function () {
                return Inertia::render('dashboard');
            })->name('dashboard');
            
            // Global users routes
            Route::resource('users', \App\Http\Controllers\UsersController::class);
        });
        
        require __DIR__.'/settings.php';
        require __DIR__.'/tenants.php';
        require __DIR__.'/auth.php';
    });
}

