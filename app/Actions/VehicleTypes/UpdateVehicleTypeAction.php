<?php

namespace App\Actions\VehicleTypes;

use App\Models\VehicleType;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateVehicleTypeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->vehicle_type);
    }

    public function rules(ActionRequest $request): array
    {
        return [
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('vehicle_types')->ignore($request->vehicle_type),
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    public function handle(VehicleType $vehicleType, array $data): VehicleType
    {
        $vehicleType->update($data);
        
        return $vehicleType;
    }

    public function asController(ActionRequest $request, VehicleType $vehicleType)
    {
        $this->handle($vehicleType, $request->validated());

        return to_route('global-settings.vehicle-types.index')
            ->with('success', 'vehicle_types.updated');
    }
} 