<?php

namespace App\Actions\Vehicles;

use App\Actions\SharedAction;
use App\Models\Vehicle;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteVehicleAction
{
    use AsAction;

    public function authorize(ActionRequest $request,): bool
    {
        return $request->user()->can('delete', $request->vehicle);
    }

    public function handle(Vehicle $vehicle): bool
    {
        return $vehicle->delete();
    }

    public function asController(ActionRequest $request, Vehicle $vehicle)
    {
        $this->handle($vehicle);

        return redirect()->route('vehicles.index')
            ->with('success', __('vehicles.deleted'));
    }
} 