<?php

namespace App\Actions\Vehicles;

use App\Http\Resources\Vehicles\VehicleLocationResource;
use App\Models\Vehicle;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Lorisleiva\Actions\Concerns\AsAction;
use Carbon\Carbon;

class GetVehicleRouteAction
{
    use AsAction;

    /**
     * Get the route history for a specific vehicle on a given date.
     *
     * @param  Vehicle  $vehicle
     * @param  string|null  $date
     * @param  bool  $onlyLatest  Whether to return only the latest position
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function handle(Vehicle $vehicle, ?string $date = null, bool $onlyLatest = false)
    {
        // Default to today if no date is provided
        $date = $date ? Carbon::parse($date) : Carbon::today();
        
        // Build the base query
        $query = VehicleLocation::where('vehicle_id', $vehicle->id)
            ->whereDate('recorded_at', $date);
        
        // If only requesting the latest position
        if ($onlyLatest) {
            return $query->latest('recorded_at')->limit(1)->get();
        }
        
        // Otherwise return all positions for the day
        return $query->orderBy('recorded_at', 'asc')->get();
    }

    /**
     * Execute the action as a controller.
     *
     * @param  Request  $request
     * @param  Vehicle  $vehicle
     * @return AnonymousResourceCollection
     */
    public function asController(Request $request, Vehicle $vehicle)
    {
        $date = $request->input('date');
        $onlyLatest = $request->boolean('latest', false);
        
        $locations = $this->handle($vehicle, $date, $onlyLatest);
        
        return VehicleLocationResource::collection($locations);
    }

    /**
     * Authorization logic.
     *
     * @param  Request  $request
     * @param  Vehicle  $vehicle
     * @return bool
     */
    public function authorize(Request $request, Vehicle $vehicle)
    {
        // TODO debug this
        // return $request->user()->can('view', $vehicle);
        return true;
    }
} 