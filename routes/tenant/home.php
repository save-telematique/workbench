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
    return redirect()->route('dashboard');
}); 