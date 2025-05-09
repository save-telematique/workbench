<?php

namespace App\Actions\VehicleModels;

use App\Models\VehicleModel;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateVehicleModelAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->vehicle_model);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'vehicle_brand_id' => ['required', 'exists:vehicle_brands,id'],
        ];
    }

    public function handle(VehicleModel $vehicleModel, array $data): VehicleModel
    {
        $vehicleModel->update($data);
        
        return $vehicleModel;
    }

    public function asController(ActionRequest $request, VehicleModel $vehicleModel)
    {
        $this->handle($vehicleModel, $request->validated());

        return to_route('global-settings.vehicle-models.index')
            ->with('success', 'vehicle_models.updated');
    }
} 