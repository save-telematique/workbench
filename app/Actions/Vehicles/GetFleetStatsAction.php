<?php

namespace App\Actions\Vehicles;

use App\Models\Vehicle;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\Concerns\AsAction;

class GetFleetStatsAction
{
    use AsAction;

    public function handle(): array
    {
        $user = Auth::user();
        
        // Get total vehicles count
        $query = Vehicle::query();
        
        // Apply tenant isolation for tenant users
        if ($user->tenant_id) {
            $query->where('tenant_id', $user->tenant_id);
        }
        
        $totalVehicles = $query->count();
        
        // Get vehicles with current location for activity stats
        $vehiclesWithLocations = $query->with([
            'currentLocation',
        ])->has('currentLocation')->get();
        
        $activeVehicles = $vehiclesWithLocations->count();
        $movingVehicles = $vehiclesWithLocations->where('currentLocation.moving', true)->count();
        $idlingVehicles = $vehiclesWithLocations->where('currentLocation.moving', false)
            ->where('currentLocation.ignition', true)->count();
        $parkedVehicles = $vehiclesWithLocations->where('currentLocation.moving', false)
            ->where('currentLocation.ignition', false)->count();
        
        return [
            'totalVehicles' => $totalVehicles,
            'activeVehicles' => $activeVehicles,
            'movingVehicles' => $movingVehicles,
            'idlingVehicles' => $idlingVehicles,
            'parkedVehicles' => $parkedVehicles,
        ];
    }

    /**
     * Authorization logic.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return request()->user()->can('viewAny', Vehicle::class);
    }
}