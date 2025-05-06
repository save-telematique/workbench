<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Model;

class TenantPolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'tenants';
    }
    
    /**
     * Tenant users should not be able to create tenants.
     */
    public function create(User $user): bool
    {
        // Only central users (not tied to a tenant) can create tenants
        if ($user->tenant_id) {
            return false;
        }
        
        return parent::create($user);
    }

    /**
     * Only central users can update tenants.
     */
    public function update(User $user, Model $model): bool
    {
        // Only central users (not tied to a tenant) can update tenants
        if ($user->tenant_id) {
            return false;
        }
        
        return parent::update($user, $model);
    }
    
    /**
     * Only central users can delete tenants.
     */
    public function delete(User $user, Model $model): bool
    {
        // Only central users (not tied to a tenant) can delete tenants
        if ($user->tenant_id) {
            return false;
        }
        
        return parent::delete($user, $model);
    }
} 