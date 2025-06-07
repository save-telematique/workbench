<?php

namespace App\Policies;

use App\Models\Geofence;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Database\Eloquent\Model;

class GeofencePolicy extends BasePolicy
{
    protected string $permissionPrefix = 'geofences';



    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Model $model): bool
    {
        // If not a tenant user, use regular permission check
        if (!$user->tenant_id) {
            return parent::view($user, $model);
        }

        // For tenant users, ensure they can only view geofences within their tenant
        if ($model instanceof Geofence && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Check group access if geofence has a group
        if ($model instanceof Geofence && $model->group_id) {
            if (!$user->canAccessResourceGroup($model->group_id)) {
                return false;
            }
        }

        return parent::view($user, $model);
    }



    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Model $model): bool
    {
        // If not a tenant user, use regular permission check
        if (!$user->tenant_id) {
            return parent::update($user, $model);
        }

        // For tenant users, ensure they can only update geofences within their tenant
        if ($model instanceof Geofence && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Check group access if geofence has a group
        if ($model instanceof Geofence && $model->group_id) {
            if (!$user->canAccessResourceGroup($model->group_id)) {
                return false;
            }
        }

        return parent::update($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Model $model): bool
    {
        // If not a tenant user, use regular permission check
        if (!$user->tenant_id) {
            return parent::delete($user, $model);
        }

        // For tenant users, ensure they can only delete geofences within their tenant
        if ($model instanceof Geofence && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Check group access if geofence has a group
        if ($model instanceof Geofence && $model->group_id) {
            if (!$user->canAccessResourceGroup($model->group_id)) {
                return false;
            }
        }

        return parent::delete($user, $model);
    }

}
