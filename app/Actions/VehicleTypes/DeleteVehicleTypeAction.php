<?php

namespace App\Actions\VehicleTypes;

use App\Models\VehicleType;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteVehicleTypeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->vehicle_type);
    }

    public function handle(VehicleType $vehicleType): bool
    {
        return $vehicleType->delete();
    }

    public function asController(ActionRequest $request, VehicleType $vehicleType)
    {
        $this->handle($vehicleType);

        return to_route('global-settings.vehicle-types.index')
            ->with('success', 'vehicle_types.deleted');
    }
} 