<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            'name' => tenant() ? tenant()->name : config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'permissions' => $this->getUserPermissions($request),
                    'roles' => $request->user()->getRoleNames(),
                ] : null,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'translations' => $this->getTranslations(),
        ]);
    }

    /**
     * Get permissions for the authenticated user.
     */
    protected function getUserPermissions(Request $request): array
    {
        if (!$request->user()) {
            return [];
        }

        return $request->user()->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Get the translation messages from language files.
     *
     * @return array
     */
    protected function getTranslations(): array
    {
        $locale = app()->getLocale();
        $fallbackLocale = config('app.fallback_locale');
        $translations = [];
        
        // Get all PHP files from the fallback locale directory
        $translationFiles = [];
        $fallbackPath = lang_path($fallbackLocale);
        
        if (is_dir($fallbackPath)) {
            $files = glob($fallbackPath . '/*.php');
            foreach ($files as $file) {
                $translationFiles[] = basename($file, '.php');
            }
        }
        
        // Add files from current locale that might not exist in fallback
        $localePath = lang_path($locale);
        if ($locale !== $fallbackLocale && is_dir($localePath)) {
            $files = glob($localePath . '/*.php');
            foreach ($files as $file) {
                $filename = basename($file, '.php');
                if (!in_array($filename, $translationFiles)) {
                    $translationFiles[] = $filename;
                }
            }
        }
        
        // Load all translation files
        foreach ($translationFiles as $file) {
            $translations[$file] = $this->loadTranslations($locale, $fallbackLocale, $file);
        }
        
        return $translations;
    }

    /**
     * Load translations for a specific file.
     *
     * @param string $locale
     * @param string $fallbackLocale
     * @param string $file
     * @return array
     */
    protected function loadTranslations(string $locale, string $fallbackLocale, string $file): array
    {
        $translations = [];
        
        // Load from fallback locale first
        if (file_exists(lang_path("$fallbackLocale/$file.php"))) {
            $translations = require lang_path("$fallbackLocale/$file.php");
        }
        
        // Then load from current locale, which will override any keys also present in the fallback
        if ($locale !== $fallbackLocale && file_exists(lang_path("$locale/$file.php"))) {
            $translations = array_merge($translations, require lang_path("$locale/$file.php"));
        }
        
        return $translations;
    }
}
