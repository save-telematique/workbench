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

        // Check if user is assigned to this specific alert
        if ($model instanceof Alert) {
            return $model->users()->where('user_id', $user->id)->exists();
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
     * More permissive than view - allows eligible users to self-assign and mark as read.
     */
    public function markAsRead(User $user, Alert $alert): bool
    {
        // Check basic permission first
        if (!$user->can('view_alerts')) {
            return false;
        }

        // Apply tenant isolation
        if ($user->tenant_id && $alert->tenant_id !== $user->tenant_id) {
            return false;
        }

        if (!$alert->tenant_id && $user->tenant_id) {
            return false;
        }

        if ($alert->users()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can mark the alert as unread.
     * More permissive than view - allows eligible users to self-assign and mark as unread.
     */
    public function markAsUnread(User $user, Alert $alert): bool
    {
        // Check basic permission first
        if (!$user->can('view_alerts')) {
            return false;
        }

        // Apply tenant isolation
        if ($user->tenant_id && $alert->tenant_id !== $user->tenant_id) {
            return false;
        }

        // Super admins can always mark alerts as unread
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // For tenant alerts, allow if user belongs to same tenant
        if ($alert->tenant_id && $user->tenant_id === $alert->tenant_id) {
            return true;
        }

        // For central alerts, allow if user is central
        if (!$alert->tenant_id && !$user->tenant_id) {
            return true;
        }

        return false;
    }
} 