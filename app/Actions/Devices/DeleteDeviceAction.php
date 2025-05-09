<?php

namespace App\Actions\Devices;

use App\Models\Device;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteDeviceAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->device);
    }

    public function handle(Device $device): Device
    {
        $device->delete();
        return $device;
    }

    public function asController(ActionRequest $request, Device $device)
    {
        $this->handle($device);

        return redirect()->route('devices.index')
            ->with('success', __('devices.deleted'));
    }
} 