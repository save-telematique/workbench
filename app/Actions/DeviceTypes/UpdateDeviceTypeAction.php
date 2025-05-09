<?php

namespace App\Actions\DeviceTypes;

use App\Models\DeviceType;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateDeviceTypeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->device_type);
    }

    public function rules(ActionRequest $request): array
    {
        return [
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('device_types')->ignore($request->device_type),
            ],
            'manufacturer' => ['required', 'string'],
        ];
    }

    public function handle(DeviceType $deviceType, array $data): DeviceType
    {
        $deviceType->update($data);
        
        return $deviceType;
    }

    public function asController(ActionRequest $request, DeviceType $deviceType)
    {
        $this->handle($deviceType, $request->validated());

        return to_route('global-settings.device-types.index')
            ->with('success', 'device_types.updated');
    }
} 