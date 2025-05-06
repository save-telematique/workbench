<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Database\Eloquent\Model;

class DriverPolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'drivers';
    }
    
    /**
     * Ensure tenant users can only access their own tenant's drivers.
     */
    public function view(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::view($user, $model);
        }
        
        // For tenant users, ensure they can only view drivers within their tenant
        if ($model instanceof Driver && $model->tenant_id !== $user->tenant_id) {
            return false;
        }
        
        return parent::view($user, $model);
    }
    
    /**
     * Ensure tenant users can only update their own tenant's drivers.
     */
    public function update(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::update($user, $model);
        }
        
        // For tenant users, ensure they can only update drivers within their tenant
        if ($model instanceof Driver && $model->tenant_id !== $user->tenant_id) {
            return false;
        }
        
        return parent::update($user, $model);
    }
    
    /**
     * Ensure tenant users can only delete their own tenant's drivers.
     */
    public function delete(User $user, Model $model): bool
    {
        // If not a tenant user or super admin, use regular permission check
        if (!$user->tenant_id) {
            return parent::delete($user, $model);
        }
        
        // For tenant users, ensure they can only delete drivers within their tenant
        if ($model instanceof Driver && $model->tenant_id !== $user->tenant_id) {
            return false;
        }
        
        return parent::delete($user, $model);
    }
} 