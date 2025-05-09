<?php

namespace App\Actions\Vehicles;

use App\Actions\SharedAction;
use App\Models\Device;
use App\Models\Vehicle;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateVehicleAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()
            && $request->user()->can('update', $request->vehicle);
    }

    public function rules(ActionRequest $request,): array
    {
        $rules = [
            'vin' => [
                'required',
                'string',
                'alpha_num',
                'size:17',
                Rule::unique('vehicles')
                    ->ignore($request->vehicle->id)
            ],
            'registration' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('vehicles')
                    ->ignore($request->vehicle->id)
            ],
            'country' => 'required|min:2|max:2',
            'vehicle_model_id' => 'required|exists:vehicle_models,id',
            'vehicle_type_id' => 'required|exists:vehicle_types,id',
        ];

        if (!tenant('id')) {
            $rules['tenant_id'] = 'required|uuid|exists:tenants,id';
            $rules['device_id'] = 'nullable|uuid|exists:devices,id';
        }

        return $rules;
    }

    /**
     * Execute the action.
     */
    public function handle(Vehicle $vehicle, array $data): Vehicle
    {

        $vehicle->update($data);

        if (
            $data['device_id']
            && ($device = Device::where('id', $data['device_id'])->where('tenant_id', $vehicle->tenant_id)->first())
        ) {
            $device->vehicle_id = $vehicle->id;
            $device->save();
        }

        return $vehicle;
    }

    public function asController(ActionRequest $request, Vehicle $vehicle)
    {
        $this->handle($vehicle, $request->validated());

        return redirect()->route('vehicles.show', $vehicle->id)
            ->with('success', __('vehicles.updated'));
    }
}
