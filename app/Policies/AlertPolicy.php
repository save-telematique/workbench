<?php

namespace App\Policies;

use App\Models\Alert;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AlertPolicy extends BasePolicy
{
    protected string $permissionPrefix = 'alerts';

    /**
     * Determine whether the user can view the alert.
     */
    public function view(User $user, Model $model): bool
    {
        // Check basic permission first
        if (!parent::view($user, $model)) {
            return false;
        }

        // Apply tenant isolation
        if ($model instanceof Alert && $user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can update the alert.
     */
    public function update(User $user, Model $model): bool
    {
        // Check basic permission first
        if (!parent::update($user, $model)) {
            return false;
        }

        // Apply tenant isolation
        if ($model instanceof Alert && $user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can delete the alert.
     */
    public function delete(User $user, Model $model): bool
    {
        // Check basic permission first
        if (!parent::delete($user, $model)) {
            return false;
        }

        // Apply tenant isolation
        if ($model instanceof Alert && $user->tenant_id && $model->tenant_id !== $user->tenant_id) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can mark the alert as read.
     * Users can always mark alerts as read if they can view them.
     */
    public function markAsRead(User $user, Alert $alert): bool
    {
        return $this->view($user, $alert);
    }

    /**
     * Determine whether the user can mark the alert as unread.
     * Users can always mark alerts as unread if they can view them.
     */
    public function markAsUnread(User $user, Alert $alert): bool
    {
        return $this->view($user, $alert);
    }
} 