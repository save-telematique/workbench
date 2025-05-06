<?php

namespace App\Policies;

use App\Models\User;

class VehicleTypePolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        $this->permissionPrefix = 'vehicle_types';
    }
} 