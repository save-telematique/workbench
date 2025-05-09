<?php

namespace App\Actions\DeviceTypes;

use App\Models\DeviceType;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteDeviceTypeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->device_type);
    }

    public function handle(DeviceType $deviceType): bool
    {
        return $deviceType->delete();
    }

    public function asController(ActionRequest $request, DeviceType $deviceType)
    {
        $this->handle($deviceType);

        return to_route('global-settings.device-types.index')
            ->with('success', 'device_types.deleted');
    }
} 