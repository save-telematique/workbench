<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workflow;
use Illuminate\Database\Eloquent\Model;

class WorkflowPolicy extends BasePolicy
{
    protected string $permissionPrefix = 'workflows';

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Model $model): bool
    {
        /** @var Workflow $model */
        // Tenant users can only view workflows in their tenant
        if ($user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::view($user, $model);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Model $model): bool
    {
        /** @var Workflow $model */
        // Tenant users can only update workflows in their tenant
        if ($user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::update($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Model $model): bool
    {
        /** @var Workflow $model */
        // Tenant users can only delete workflows in their tenant
        if ($user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::delete($user, $model);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Model $model): bool
    {
        /** @var Workflow $model */
        // Tenant users can only restore workflows in their tenant
        if ($user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::restore($user, $model);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Model $model): bool
    {
        /** @var Workflow $model */
        // Tenant users can only force delete workflows in their tenant
        if ($user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return parent::forceDelete($user, $model);
    }
} 