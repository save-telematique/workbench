<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class GroupPolicy extends BasePolicy
{
    protected string $permissionPrefix = 'groups';

    /**
     * Determine whether the user can view any groups.
     */
    public function viewAny(User $user): bool
    {
        return parent::viewAny($user);
    }

    /**
     * Determine whether the user can view the group.
     */
    public function view(User $user, Model $group): bool
    {
        // Tenant users can only view groups within their tenant
        if ($user->tenant_id && $group->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::view($user, $group);
    }

    /**
     * Determine whether the user can create groups.
     */
    public function create(User $user): bool
    {
        return parent::create($user);
    }

    /**
     * Determine whether the user can update the group.
     */
    public function update(User $user, Model $group): bool
    {
        // Tenant users can only update groups within their tenant
        if ($user->tenant_id && $group->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::update($user, $group);
    }

    /**
     * Determine whether the user can delete the group.
     */
    public function delete(User $user, Model $group): bool
    {
        // Tenant users can only delete groups within their tenant
        if ($user->tenant_id && $group->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Cannot delete groups that have child groups
        if ($group->children()->exists()) {
            return false;
        }

        // Cannot delete groups that have vehicles or drivers assigned
        if ($group->vehicles()->exists() || $group->drivers()->exists()) {
            return false;
        }

        return parent::delete($user, $group);
    }

    /**
     * Determine whether the user can restore the group.
     */
    public function restore(User $user, Model $group): bool
    {
        // Tenant users can only restore groups within their tenant
        if ($user->tenant_id && $group->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::restore($user, $group);
    }

    /**
     * Determine whether the user can permanently delete the group.
     */
    public function forceDelete(User $user, Model $group): bool
    {
        // Tenant users can only force delete groups within their tenant
        if ($user->tenant_id && $group->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::forceDelete($user, $group);
    }
} 