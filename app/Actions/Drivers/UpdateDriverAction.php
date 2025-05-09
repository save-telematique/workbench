<?php

namespace App\Actions\Drivers;

use App\Models\Driver;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateDriverAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->driver);
    }

    public function rules(ActionRequest $request): array
    {
        $rules = [
            'surname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:255',
            'card_issuing_country' => 'nullable|string|max:2',
            'card_number' => 'nullable|string|max:255',
            'birthdate' => 'nullable|date',
            'card_issuing_date' => 'nullable|date',
            'card_expiration_date' => 'nullable|date',
            'user_id' => 'nullable|uuid|exists:users,id',
        ];

        if (!tenant('id')) {
            $rules['tenant_id'] = 'required|uuid|exists:tenants,id';
        }

        return $rules;
    }

    /**
     * Execute the action.
     */
    public function handle(Driver $driver, array $data): Driver
    {
        $driver->update($data);
        return $driver;
    }

    public function asController(ActionRequest $request, Driver $driver)
    {
        $this->handle($driver, $request->validated());

        return to_route('drivers.show', $driver)
            ->with('success', __('drivers.messages.updated_successfully'));
    }
} 