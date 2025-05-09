<?php

namespace App\Actions\VehicleTypes;

use App\Models\VehicleType;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateVehicleTypeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', VehicleType::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:vehicle_types,name'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function handle(array $data): VehicleType
    {
        return VehicleType::create($data);
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->validated());

        return to_route('global-settings.vehicle-types.index')
            ->with('success', 'vehicle_types.created');
    }
} 