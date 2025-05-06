<?php

namespace App\Policies;

use App\Models\DeviceMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class DeviceMessagePolicy extends BasePolicy
{
    protected string $permissionPrefix = 'device_messages';

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return bool
     */
    public function view(User $user, Model $model): bool
    {
        // Check basic permission
        if (!$user->hasPermissionTo("view_{$this->permissionPrefix}")) {
            return false;
        }

        // For tenant users, check if the device belongs to their tenant
        if ($user->isTenantUser()) {
            $device = $model->device;
            return $device && $device->tenant_id === $user->tenant_id;
        }

        return true;
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo("view_{$this->permissionPrefix}");
    }
} 