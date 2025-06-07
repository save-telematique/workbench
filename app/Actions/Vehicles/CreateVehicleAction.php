<?php

namespace App\Actions\Vehicles;

use App\Models\Device;
use App\Models\Vehicle;
use App\Policies\VehiclePolicy;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateVehicleAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Vehicle::class);
    }

    public function rules(): array
    {
        $rules = [
            'vin' => [
                'required', 
                'string', 
                'alpha_num', 
                'size:17', 
                'unique:vehicles,vin'
            ],
            'registration' => [
                'nullable', 
                'string', 
                'max:20', 
                'unique:vehicles,registration'
            ],
            'country' => 'required|min:2|max:2',
            'vehicle_model_id' => 'required|exists:vehicle_models,id',
            'vehicle_type_id' => 'required|exists:vehicle_types,id',
            'group_id' => 'nullable|uuid|exists:groups,id',
        ];

        if (!tenant('id')) {
            $rules['tenant_id'] = 'required|uuid|exists:tenants,id';
            $rules['device_id'] = 'nullable|uuid|exists:devices,id';
        }

        return $rules;
    }

    public function handle(array $data): Vehicle
    {
        // Force tenant_id if tenant is set user is in tenant context
        if (tenant('id')) {
            $data['tenant_id'] = tenant('id');
        }

        $vehicle = new Vehicle($data);
        $vehicle->save();

        if (isset($data['device_id']) && $data['device_id']
            && ($device = Device::where('id', $data['device_id'])->where('tenant_id', $vehicle->tenant_id)->first())
        ) {
            $device->vehicle_id = $vehicle->id;
            $device->save();
        }
        
        return $vehicle;
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->validated());

        return to_route('vehicles.index')
            ->with('success', __('vehicles.created'));
    }
} 