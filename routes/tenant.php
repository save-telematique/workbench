<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomainOrSubdomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Public tenant routes
    require __DIR__ . '/tenant/home.php';
    require __DIR__ . '/auth.php';
    
    // Authenticated tenant routes
    Route::middleware(['auth', 'verified'])->group(function () {
        require __DIR__ . '/tenant/dashboard.php';
        
        // Add more tenant-specific route files here as needed
        // Example: require __DIR__ . '/tenant/vehicles.php';
    });
    
    // Other tenant routes
    require __DIR__ . '/settings.php';
});
