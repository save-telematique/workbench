<?php

namespace App\Providers;

use App\Models\VehicleType;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Policies\VehicleTypePolicy;
use App\Policies\VehicleBrandPolicy;
use App\Policies\VehicleModelPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        VehicleType::class => VehicleTypePolicy::class,
        VehicleBrand::class => VehicleBrandPolicy::class,
        VehicleModel::class => VehicleModelPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
