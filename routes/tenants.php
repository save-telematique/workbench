<?php

use App\Http\Controllers\TenantController;
use App\Http\Controllers\TenantDomainsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth', 'universal')->group(function () {
    Route::resource('tenants', TenantController::class);
    
    // Tenant Domains routes
    Route::get('tenants/{tenant}/domains', [TenantDomainsController::class, 'index'])->name('tenants.domains.index');
    Route::post('tenants/{tenant}/domains', [TenantDomainsController::class, 'store'])->name('tenants.domains.store');
    Route::delete('tenants/{tenant}/domains/{domain}', [TenantDomainsController::class, 'destroy'])->name('tenants.domains.destroy');
}); 