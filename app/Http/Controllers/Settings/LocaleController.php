<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocaleController extends Controller
{
    /**
     * Display the locale settings page.
     */
    public function index()
    {
        return Inertia::render('settings/locale');
    }

    /**
     * Update the user's locale.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:en,fr'],
        ]);

        if ($request->user()) {
            $request->user()->update([
                'locale' => $validated['locale']
            ]);
        }

        app()->setLocale($validated['locale']);
        
        return response()->json(['message' => 'Locale updated successfully']);
    }
} 