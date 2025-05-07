<?php

namespace App\Http\Requests\Vehicles;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
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
            'registration' => [
                'nullable', 
                'string', 
                'max:20',
                Rule::unique('vehicles', 'registration')->ignore($this->route('vehicle')),
            ],
            'brand' => ['sometimes', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'vin' => [
                'required', 
                'string', 
                'max:50',
                Rule::unique('vehicles', 'vin')->ignore($this->route('vehicle')),
            ],
            'tenant_id' => ['nullable', 'string'],
            'device_id' => ['nullable', 'string'],
        ];
    }
} 