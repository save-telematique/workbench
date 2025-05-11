<?php

namespace App\Actions\Vehicles;

use App\Http\Resources\Vehicles\VehicleResource;
use App\Models\Vehicle;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;
use Lorisleiva\Actions\Concerns\AsAction;
use Illuminate\Support\Facades\Auth;

class GetVehiclesWithLocationsAction
{
    use AsAction;

    public function handle(): Collection
    {
        $vehicles = Vehicle::with([
            'currentLocation',
            'model',
            'model.vehicleBrand',
            'type',
            'currentDriver',
            'currentWorkingSession',
            'currentWorkingSession.activity',
            'tenant',
        ])->has('currentLocation')->get();

        return $vehicles;
    }

    /**
     * Execute the action as a controller.
     *
     * @return AnonymousResourceCollection
     */
    public function asController(): AnonymousResourceCollection
    {
        $vehicles = $this->handle();

        return VehicleResource::collection($vehicles);
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