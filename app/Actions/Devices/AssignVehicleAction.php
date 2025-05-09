<?php

namespace App\Actions\Devices;

use App\Models\Device;
use App\Models\Vehicle;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class AssignVehicleAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->device);
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
        ];
    }

    public function handle(Device $device, Vehicle $vehicle): Device
    {
        if ($device->tenant_id && $vehicle->tenant_id !== $device->tenant_id) {
            throw new \InvalidArgumentException(__('devices.assign_vehicle.tenant_mismatch'));
        }
        
        $device->vehicle_id = $vehicle->id;
        $device->save();
        
        return $device;
    }

    public function asController(ActionRequest $request, Device $device, Vehicle $vehicle)
    {
        $this->handle($device, $vehicle);

        return redirect()->route('devices.show', $device->id)
            ->with('success', __('devices.assign_vehicle.success'));
    }
} 