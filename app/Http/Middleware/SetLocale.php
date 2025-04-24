<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasHeader('Accept-Language')) {
            $locale = $request->header('Accept-Language');
            if (in_array($locale, ['en', 'fr'])) {
                app()->setLocale($locale);
            }
        }
        
        // If no valid header, check session
        elseif (session()->has('locale') && in_array(session('locale'), ['en', 'fr'])) {
            app()->setLocale(session('locale'));
        } else {
            app()->setLocale($request->getPreferredLanguage());
        }
        
        return $next($request);
    }
} 