<?php

namespace App\Actions\VehicleModels;

use App\Models\VehicleModel;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateVehicleModelAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', VehicleModel::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'vehicle_brand_id' => ['required', 'exists:vehicle_brands,id'],
        ];
    }

    public function handle(array $data): VehicleModel
    {
        return VehicleModel::create($data);
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->validated());

        return to_route('global-settings.vehicle-models.index')
            ->with('success', 'vehicle_models.created');
    }
} 