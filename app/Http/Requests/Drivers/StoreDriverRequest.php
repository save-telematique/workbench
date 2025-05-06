<?php

namespace App\Http\Requests\Drivers;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDriverRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will use policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'surname' => ['required', 'string', 'max:100'],
            'firstname' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'user_id' => [
                'nullable', 
                'integer',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    if ($value === null) {
                        return;
                    }

                    $user = User::find($value);
                    $tenantId = $this->input('tenant_id');

                    if ($user && !is_null($user->tenant_id) && $user->tenant_id !== $tenantId) {
                        $fail(__('validation.custom.user_id.tenant_mismatch'));
                    }
                },
            ],
            'card_issuing_country' => ['nullable', 'string', 'max:50'],
            'card_number' => ['nullable', 'string', 'max:50'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'birthdate' => ['nullable', 'date'],
            'card_issuing_date' => ['nullable', 'date'],
            'card_expiration_date' => ['nullable', 'date'],
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
        ];
    }
} 