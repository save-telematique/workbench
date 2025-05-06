<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Access\Response;

class UserPolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'users';
    }

    /**
     * Prevent users from deleting themselves.
     */
    public function delete(User $user, Model $model): bool
    {
        if ($model instanceof User && $user->id === $model->id) {
            return false;
        }
        
        return $user->hasPermissionTo("delete_{$this->permissionPrefix}");
    }
} 