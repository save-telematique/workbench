<?php

namespace App\Providers;

use App\Models\Device;
use App\Models\DeviceMessage;
use App\Models\DeviceType;
use App\Models\Driver;
use App\Models\Geofence;
use App\Models\Group;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use App\Policies\DeviceMessagePolicy;
use App\Policies\DevicePolicy;
use App\Policies\DeviceTypePolicy;
use App\Policies\DriverPolicy;
use App\Policies\GeofencePolicy;
use App\Policies\GroupPolicy;
use App\Policies\TenantPolicy;
use App\Policies\UserPolicy;
use App\Policies\VehiclePolicy;
use App\Policies\VehicleBrandPolicy;
use App\Policies\VehicleModelPolicy;
use App\Policies\VehicleTypePolicy;
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
        Device::class => DevicePolicy::class,
        DeviceMessage::class => DeviceMessagePolicy::class,
        DeviceType::class => DeviceTypePolicy::class,
        Driver::class => DriverPolicy::class,
        Geofence::class => GeofencePolicy::class,
        Group::class => GroupPolicy::class,
        Tenant::class => TenantPolicy::class,
        User::class => UserPolicy::class,
        Vehicle::class => VehiclePolicy::class,
        VehicleBrand::class => VehicleBrandPolicy::class,
        VehicleModel::class => VehicleModelPolicy::class,
        VehicleType::class => VehicleTypePolicy::class,
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

        // Define a gate for 'super-admin' that allows full access
        Gate::before(function (User $user, string $ability) {
            if ($user->hasRole('super_admin')) {
                return true;
            }
        });
    }
}
