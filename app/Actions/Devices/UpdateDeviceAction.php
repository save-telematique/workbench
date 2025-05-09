<?php

namespace App\Actions\Devices;

use App\Models\Device;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateDeviceAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->device);
    }

    public function rules(ActionRequest $request): array
    {
        $rules = [
            'serial_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('devices')->ignore($request->device->id)
            ],
            'imei' => [
                'required',
                'string',
                'max:15',
                Rule::unique('devices')->ignore($request->device->id)
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

    /**
     * Execute the action.
     */
    public function handle(Device $device, array $data): Device
    {
        $device->update($data);
        return $device;
    }

    public function asController(ActionRequest $request, Device $device)
    {
        $this->handle($device, $request->validated());

        return redirect()->route('devices.show', $device->id)
            ->with('success', __('devices.updated'));
    }
} 