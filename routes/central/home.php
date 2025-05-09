<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Home Routes
|--------------------------------------------------------------------------
|
| Main entry point routes for the central application
|
*/

Route::get('/', function () {
    return 'home';
})->name('home'); 