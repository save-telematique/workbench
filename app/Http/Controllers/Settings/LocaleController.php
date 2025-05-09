<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LocaleController extends Controller
{
    /**
     * Display the locale settings page.
     */
    public function index(): Response
    {
        return Inertia::render('settings/locale');
    }
} 