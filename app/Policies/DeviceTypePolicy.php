<?php

namespace App\Policies;

use App\Models\User;

class DeviceTypePolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'device_types';
    }
} 