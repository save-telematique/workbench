<?php

namespace App\Actions\DeviceTypes;

use App\Models\DeviceType;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateDeviceTypeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', DeviceType::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:device_types,name'],
            'manufacturer' => ['required', 'string'],
        ];
    }

    public function handle(array $data): DeviceType
    {
        return DeviceType::create($data);
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->validated());

        return to_route('global-settings.device-types.index')
            ->with('success', 'device_types.created');
    }
} 