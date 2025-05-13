<?php

namespace App\Actions\Vehicles;

use App\Http\Resources\ActivityChanges\ActivityChangeResource;
use App\Models\Vehicle;
use App\Models\ActivityChange;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Lorisleiva\Actions\Concerns\AsAction;
use Carbon\Carbon;

class GetVehicleActivityChangesAction
{
    use AsAction;

    /**
     * Get the activity changes for a specific vehicle on a given date.
     *
     * @param  Vehicle  $vehicle
     * @param  string|null  $date
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function handle(Vehicle $vehicle, ?string $date = null)
    {
        // Default to today if no date is provided
        $date = $date ? Carbon::parse($date) : Carbon::today();
        
        // Get all activity changes for the vehicle on the specified date
        return ActivityChange::where('vehicle_id', $vehicle->id)
            ->whereDate('recorded_at', $date)
            ->with('activity')
            ->orderBy('recorded_at', 'asc')
            ->get();
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
        
        $activityChanges = $this->handle($vehicle, $date);
        
        return ActivityChangeResource::collection($activityChanges);
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
        return $request->user()->can('view', $vehicle);
    }
} 