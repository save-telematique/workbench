<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
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
                    $domain = $domain . '.' . parse_url(config('app.url'), PHP_URL_HOST);
                }

                return tenant_route($domain, 'password.reset', ['token' => $token, 'email' => $notifiable->getEmailForPasswordReset()]);
            }

            return route('password.reset', ['token' => $token, 'email' => $notifiable->getEmailForPasswordReset()]);
        });

        JsonResource::withoutWrapping();
        Model::preventLazyLoading();
    }
}
