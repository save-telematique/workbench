<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tenant Home Routes
|--------------------------------------------------------------------------
|
| Main entry point routes for tenant application
|
*/

Route::get('/', function () {
    return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
}); 