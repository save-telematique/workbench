<?php

use App\Actions\Tenants\CreateTenantAction;
use App\Actions\Tenants\UpdateTenantAction;
use App\Actions\Tenants\DeleteTenantAction;
use App\Actions\Tenants\CreateDomainAction;
use App\Actions\Tenants\DeleteDomainAction;
use App\Http\Controllers\Tenants\TenantController;
use App\Http\Controllers\Tenants\TenantDomainsController;
use App\Http\Controllers\Tenants\TenantUsersController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth', 'universal')->group(function () {
    // Tenant display routes
    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::get('/tenants/create', [TenantController::class, 'create'])->name('tenants.create');
    Route::get('/tenants/{tenant}', [TenantController::class, 'show'])->name('tenants.show');
    Route::get('/tenants/{tenant}/edit', [TenantController::class, 'edit'])->name('tenants.edit');
    
    // Tenant action routes
    Route::post('/tenants', CreateTenantAction::class)->name('tenants.store');
    Route::put('/tenants/{tenant}', UpdateTenantAction::class)->name('tenants.update');
    Route::delete('/tenants/{tenant}', DeleteTenantAction::class)->name('tenants.destroy');
    
    // Tenant Domains routes
    Route::get('/tenants/{tenant}/domains', [TenantDomainsController::class, 'index'])->name('tenants.domains.index');
    Route::post('/tenants/{tenant}/domains', CreateDomainAction::class)->name('tenants.domains.store');
    Route::delete('/tenants/{tenant}/domains/{domain}', DeleteDomainAction::class)->name('tenants.domains.destroy');
    
    // Tenant Users routes
    Route::resource('tenants.users', TenantUsersController::class);
}); 