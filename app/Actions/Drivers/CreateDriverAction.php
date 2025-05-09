<?php

namespace App\Actions\Drivers;

use App\Models\Driver;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateDriverAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Driver::class);
    }

    public function rules(): array
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

    public function handle(array $data): Driver
    {
        // Force tenant_id if tenant is set (user is in tenant context)
        if (tenant('id')) {
            $data['tenant_id'] = tenant('id');
        }

        $driver = new Driver($data);
        $driver->save();
        
        return $driver;
    }

    public function asController(ActionRequest $request)
    {
        $driver = $this->handle($request->validated());

        return to_route('drivers.index')
            ->with('success', __('drivers.messages.created_successfully'));
    }
} 