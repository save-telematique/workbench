<?php

namespace App\Actions\Devices;

use App\Models\Device;
use App\Models\Vehicle;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateDeviceAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Device::class);
    }

    public function rules(): array
    {
        $rules = [
            'serial_number' => [
                'required', 
                'string', 
                'max:100', 
                'unique:devices,serial_number'
            ],
            'imei' => [
                'required',
                'string',
                'max:15',
                'unique:devices,imei'
            ],
            'device_type_id' => 'required|exists:device_types,id',
            'description' => 'nullable|string|max:1000',
            'configuration' => 'nullable|array',
        ];

        if (!tenant('id')) {
            $rules['tenant_id'] = 'nullable|uuid|exists:tenants,id';
            $rules['vehicle_id'] = 'nullable|uuid|exists:vehicles,id';
        }

        return $rules;
    }

    public function handle(array $data): Device
    {
        if (tenant('id')) {
            $data['tenant_id'] = tenant('id');
        }

        if (isset($data['vehicle_id'])) {
            $data['tenant_id'] = Vehicle::find($data['vehicle_id'])->tenant_id;
        }

        $device = new Device($data);
        $device->save();
        
        return $device;
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->validated());

        return to_route('devices.index')
            ->with('success', __('devices.created'));
    }
} 