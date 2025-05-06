<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Device;
use Illuminate\Database\Eloquent\Model;

class DevicePolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'devices';
    }
    
    /**
     * Ensure tenant users can only access their own tenant's devices.
     */
    public function view(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::view($user, $model);
        }
        
        // For tenant users, ensure they can only view devices within their tenant
        if ($model instanceof Device && $model->tenant_id !== $user->tenant_id) {
            return false;
        }
        
        return parent::view($user, $model);
    }
    
    /**
     * Ensure tenant users can only update their own tenant's devices.
     */
    public function update(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::update($user, $model);
        }
        
        // For tenant users, ensure they can only update devices within their tenant
        if ($model instanceof Device && $model->tenant_id !== $user->tenant_id) {
            return false;
        }
        
        return parent::update($user, $model);
    }
    
    /**
     * Ensure tenant users can only delete their own tenant's devices.
     */
    public function delete(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::delete($user, $model);
        }
        
        // For tenant users, ensure they can only delete devices within their tenant
        if ($model instanceof Device && $model->tenant_id !== $user->tenant_id) {
            return false;
        }
        
        return parent::delete($user, $model);
    }
} 