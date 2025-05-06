<?php

namespace App\Http\Requests\Devices;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeviceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'device_type_id' => ['required', 'exists:device_types,id'],
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'firmware_version' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['required', 'string', 'max:255'],
            'sim_number' => ['nullable', 'string', 'max:255'],
            'imei' => ['required', 'string', 'max:255', Rule::unique('devices', 'imei')],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'tenant_id' => $this->tenant_id === 'none' ? null : $this->tenant_id,
            'vehicle_id' => $this->vehicle_id === 'none' ? null : $this->vehicle_id,
        ]);
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'device_type_id' => __('devices.fields.device_type'),
            'tenant_id' => __('devices.fields.tenant'),
            'vehicle_id' => __('devices.fields.vehicle'),
            'firmware_version' => __('devices.fields.firmware_version'),
            'serial_number' => __('devices.fields.serial_number'),
            'sim_number' => __('devices.fields.sim_number'),
            'imei' => __('devices.fields.imei'),
        ];
    }
} 