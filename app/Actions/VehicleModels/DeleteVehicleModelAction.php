<?php

namespace App\Actions\VehicleModels;

use App\Models\VehicleModel;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteVehicleModelAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->vehicle_model);
    }

    public function handle(VehicleModel $vehicleModel): bool
    {
        return $vehicleModel->delete();
    }

    public function asController(ActionRequest $request, VehicleModel $vehicleModel)
    {
        $this->handle($vehicleModel);

        return to_route('global-settings.vehicle-models.index')
            ->with('success', 'vehicle_models.deleted');
    }
} 