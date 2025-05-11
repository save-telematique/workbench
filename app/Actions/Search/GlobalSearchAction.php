<?php

namespace App\Actions\Search;

use App\Models\Device;
use App\Models\Driver;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class GlobalSearchAction
{
    use AsAction;

    /**
     * Execute the global search across multiple resources
     * 
     * @param string $query The search query
     * @param int $limit Maximum number of results per resource type
     * @param array|null $types Resource types to search (null for all)
     * @return Collection
     */
    public function handle(string $query, int $limit = 5, ?array $types = null): Collection
    {
        $results = collect();
        $searchableTypes = $types ?? ['users', 'vehicles', 'devices', 'drivers', 'tenants'];
        
        // Only search resources the user has permission to view
        if (in_array('users', $searchableTypes) && Gate::allows('view_users')) {
            $usersResults = $this->searchUsers($query, $limit);
            $results = $results->merge($usersResults);
        }
        
        if (in_array('vehicles', $searchableTypes) && Gate::allows('view_vehicles')) {
            $vehiclesResults = $this->searchVehicles($query, $limit);
            $results = $results->merge($vehiclesResults);
        }
        
        if (in_array('devices', $searchableTypes) && Gate::allows('view_devices')) {
            $devicesResults = $this->searchDevices($query, $limit);
            $results = $results->merge($devicesResults);
        }
        
        if (in_array('drivers', $searchableTypes) && Gate::allows('view_drivers')) {
            $driversResults = $this->searchDrivers($query, $limit);
            $results = $results->merge($driversResults);
        }
        
        if (in_array('tenants', $searchableTypes) && Gate::allows('view_tenants')) {
            $tenantsResults = $this->searchTenants($query, $limit);
            $results = $results->merge($tenantsResults);
        }
        
        return $results;
    }
    
    /**
     * Search for users
     * 
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    private function searchUsers(string $query, int $limit): Collection
    {
        $users = User::search($query)
            ->take($limit)
            ->get(['id', 'name', 'email']);
            
        return $users->map(function ($user) {
            return [
                'id' => $user->id,
                'title' => $user->name,
                'description' => $user->email,
                'resource_type' => 'user',
                'url' => route('users.show', $user->id),
                'icon' => 'user'
            ];
        });
    }
    
    /**
     * Search for vehicles
     * 
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    private function searchVehicles(string $query, int $limit): Collection
    {
        $user = Auth::user();
        
        $vehicles = Vehicle::search($query)
            ->when($user && $user->tenant_id, function($query) use ($user) {
                $query->where('tenant_id', $user->tenant_id);
            })
            ->take($limit)
            ->get();

        $vehicles->load(['model', 'model.vehicleBrand']);
        return $vehicles->map(function ($vehicle) {
            $description = $vehicle->registration;
            if ($vehicle->model && $vehicle->model->vehicleBrand) {
                $description .= ' - ' . $vehicle->model->vehicleBrand->name . ' ' . $vehicle->model->name;
            }
            
            return [
                'id' => $vehicle->id,
                'title' => $vehicle->registration ?: $vehicle->vin,
                'description' => $description,
                'resource_type' => 'vehicle',
                'url' => route('vehicles.show', $vehicle->id),
                'icon' => 'car'
            ];
        });
    }
    
    /**
     * Search for devices
     * 
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    private function searchDevices(string $query, int $limit): Collection
    {
        $devices = Device::search($query)
            ->take($limit)
            ->get(['id', 'name', 'serial_number', 'device_type_id'])
            ->load(['type:id,name']);
            
        return $devices->map(function (Device $device) {
            return [
                'id' => $device->id,
                'title' => $device->imei,
                'description' => $device->serial_number . ($device->type ? ' - ' . $device->type->name : ''),
                'resource_type' => 'device',
                'url' => route('devices.show', $device->id),
                'icon' => 'cpu'
            ];
        });
    }
    
    /**
     * Search for drivers
     * 
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    private function searchDrivers(string $query, int $limit): Collection
    {
        $user = Auth::user();
        
        $drivers = Driver::search($query)
            ->when($user && $user->tenant_id, function($query) use ($user) {
                $query->where('tenant_id', $user->tenant_id);
            })
            ->take($limit)
            ->get(['id', 'name', 'license_number']);
            
        return $drivers->map(function ($driver) {
            return [
                'id' => $driver->id,
                'title' => $driver->firstname . ' ' . $driver->surname,
                'description' => $driver->license_number ? 'License: ' . $driver->license_number : '',
                'resource_type' => 'driver',
                'url' => route('drivers.show', $driver->id),
                'icon' => 'user-cog'
            ];
        });
    }
    
    /**
     * Search for tenants
     * 
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    private function searchTenants(string $query, int $limit): Collection
    {
        $tenants = Tenant::search($query)
            ->take($limit)
            ->get(['id', 'name']);
            
        return $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'title' => $tenant->name,
                'description' => '',
                'resource_type' => 'tenant',
                'url' => route('tenants.show', $tenant->id),
                'icon' => 'building-2'
            ];
        });
    }
    

    public function asController(ActionRequest $request): JsonResponse
    {
        $query = $request->input('query', '');
        $limit = $request->input('limit', 5);
        $types = $request->input('types') ? explode(',', $request->input('types')) : null;
        
        // Short-circuit for empty queries
        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }
        
        $results = $this->handle($query, $limit, $types);
        
        return response()->json($results);
    }
} 