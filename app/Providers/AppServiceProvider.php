<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            Log::info($notifiable);
            if ($notifiable->tenant) {
                $domain = $notifiable->tenant->domains->first()->domain;

                if (!str_contains($domain, '.')) {
                    $hostname = str_contains(config('app.url'), 'http') ? parse_url(config('app.url'), PHP_URL_HOST) : config('app.url');
                    $domain = $domain . '.' . $hostname;
                }

                return URL::formatHostUsing(fn () => (parse_url(config('app.url'), PHP_URL_SCHEME) ?? 'https') . '://' . $domain)
                    ->temporarySignedRoute('password.reset', now()->addDays(1), ['token' => $token, 'email' => $notifiable->getEmailForPasswordReset()]);
            }

            return URL::temporarySignedRoute('password.reset', now()->addDays(1), ['token' => $token, 'email' => $notifiable->getEmailForPasswordReset()]);
        });

        JsonResource::withoutWrapping();
        Model::preventLazyLoading();
    }
}
