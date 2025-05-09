<?php

namespace App\Actions\Devices;

use App\Models\Device;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UnassignVehicleAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->device);
    }

    public function handle(Device $device): Device
    {
        $device->vehicle_id = null;
        $device->save();
        
        return $device;
    }

    public function asController(ActionRequest $request, Device $device)
    {
        $this->handle($device);

        return redirect()->route('devices.show', $device->id)
            ->with('success', __('devices.unassign_vehicle.success'));
    }
} 