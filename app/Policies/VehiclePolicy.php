<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Model;

class VehiclePolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'vehicles';
    }
    
    /**
     * Ensure tenant users can only access their own tenant's vehicles.
     */
    public function view(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::view($user, $model);
        }
        
        // For tenant users, ensure they can only view vehicles within their tenant
        if ($model instanceof Vehicle && $model->tenant_id !== $user->tenant_id) {
            return false;
        }


        // Check group access if vehicle has a group
        if ($model instanceof Vehicle && $model->group_id) {
            if (!$user->canAccessResourceGroup($model->group_id)) {
                return false;
            }
        }

        return parent::view($user, $model);
    }
    
    /**
     * Ensure tenant users can only update their own tenant's vehicles.
     */
    public function update(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::update($user, $model);
        }
        
        // For tenant users, ensure they can only update vehicles within their tenant
        if ($model instanceof Vehicle && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Check group access if vehicle has a group
        if ($model instanceof Vehicle && $model->group_id) {
            if (!$user->canAccessResourceGroup($model->group_id)) {
                return false;
            }
        }
        
        return parent::update($user, $model);
    }
    
    /**
     * Ensure tenant users can only delete their own tenant's vehicles.
     */
    public function delete(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::delete($user, $model);
        }
        
        // For tenant users, ensure they can only delete vehicles within their tenant
        if ($model instanceof Vehicle && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Check group access if vehicle has a group
        if ($model instanceof Vehicle && $model->group_id) {
            if (!$user->canAccessResourceGroup($model->group_id)) {
                return false;
            }
        }
        
        return parent::delete($user, $model);
    }
} 