<?php

namespace App\Http\Requests\Vehicles;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will use policies later
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'registration' => ['nullable', 'string', 'max:20', 'unique:vehicles,registration'],
            'model_id' => ['required', 'exists:vehicle_models,id'],
            'vehicle_type_id' => ['required', 'exists:vehicle_types,id'],
            'color' => ['required', 'string', 'max:30'],
            'vin' => ['required', 'string', 'max:50', 'unique:vehicles,vin'],
            'year' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'tenant_id' => ['nullable', 'string'],
            'device_id' => ['nullable', 'string'],
        ];
    }
} 