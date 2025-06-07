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
    require __DIR__ . '/shared/auth.php';
    
    // Authenticated tenant routes
    Route::middleware(['auth', 'verified'])->group(function () {
        require __DIR__ . '/tenant/dashboard.php';
        require __DIR__ . '/tenant/geofences.php';
        
        require __DIR__ . '/shared/settings.php';
        require __DIR__ . '/shared/vehicles.php';
        require __DIR__ . '/shared/drivers.php';
        require __DIR__ . '/shared/groups.php';
        require __DIR__ . '/shared/users.php';
        require __DIR__ . '/shared/api.php';

    });
    
    // Other tenant routes
});
