<?php

namespace App\Actions\Groups;

use App\Models\Group;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateGroupAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Group::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'parent_id' => 'nullable|exists:groups,id',
            'tenant_id' => 'required|exists:tenants,id',
            'is_active' => 'boolean',
        ];
    }

    public function getValidationMessages(): array
    {
        return [
            'name.required' => __('groups.validation.name_required'),
            'name.max' => __('groups.validation.name_max'),
            'description.max' => __('groups.validation.description_max'),
            'color.regex' => __('groups.validation.color_format'),
            'parent_id.exists' => __('groups.validation.parent_exists'),
            'tenant_id.required' => __('groups.validation.tenant_required'),
            'tenant_id.exists' => __('groups.validation.tenant_exists'),
        ];
    }

    public function handle(array $data): Group
    {
        $user = Auth::user();
        
        // For tenant users, override tenant_id with their tenant
        if ($user->tenant_id) {
            $data['tenant_id'] = $user->tenant_id;
        }

        // Validate that the user has access to the specified tenant
        if (!$user->tenant_id && !$user->hasRole('super_admin')) {
            // Central users (non-super_admin) need specific permissions to create groups for tenants
            // This is already handled by the policy authorization
        }

        // Validate parent group belongs to same tenant if specified
        if (isset($data['parent_id'])) {
            $parentGroup = Group::find($data['parent_id']);
            if (!$parentGroup) {
                throw new \Exception(__('groups.validation.parent_exists'));
            }
            if ($parentGroup->tenant_id !== $data['tenant_id']) {
                throw new \Exception(__('groups.errors.parent_different_tenant'));
            }
        }

        // Set default active status
        $data['is_active'] = $data['is_active'] ?? true;

        return Group::create($data);
    }

    public function asController(ActionRequest $request)
    {
        try {
            $group = $this->handle($request->validated());

            return to_route('groups.show', $group)
                ->with('success', __('groups.messages.created'));
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['general' => $e->getMessage()]);
        }
    }
} 