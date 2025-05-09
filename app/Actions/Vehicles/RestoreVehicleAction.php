<?php

namespace App\Actions\Vehicles;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Lorisleiva\Actions\Concerns\AsAction;
use Lorisleiva\Actions\ActionRequest;

class RestoreVehicleAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('restore', $request->vehicle);
    }

    public function handle(Vehicle $vehicle): bool
    {
        if (!$vehicle->trashed()) {
            return false;
        }

        return $vehicle->restore();
    }

    public function asController(Request $request, Vehicle $vehicle)
    {
        $this->handle($vehicle);

        return to_route('vehicles.index')
            ->with('success', __('vehicles.restored'));
    }
} 