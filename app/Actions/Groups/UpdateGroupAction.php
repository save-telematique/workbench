<?php

namespace App\Actions\Groups;

use App\Models\Group;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateGroupAction
{
    use AsAction;

    public function authorize(ActionRequest $request, Group $group): bool
    {
        return $request->user()->can('update', $group);
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

    public function handle(Group $group, array $data): Group
    {
        $user = Auth::user();

        // For tenant users, override tenant_id with their tenant
        if ($user->tenant_id) {
            $data['tenant_id'] = $user->tenant_id;
        }

        // Prevent tenant changes for existing groups with relationships
        if ($group->tenant_id !== $data['tenant_id']) {
            if ($group->children()->exists() || $group->vehicles()->exists() || $group->drivers()->exists()) {
                throw new \Exception(__('groups.errors.cannot_change_tenant_with_relations'));
            }
        }

        // Validate parent group belongs to same tenant if specified
        if (isset($data['parent_id'])) {
            // Prevent circular references
            if ($data['parent_id'] == $group->id) {
                throw new \Exception(__('groups.errors.circular_reference'));
            }

            $parentGroup = Group::find($data['parent_id']);
            if (!$parentGroup) {
                throw new \Exception(__('groups.validation.parent_exists'));
            }
            
            // Check if the new parent would create a circular reference
            if ($parentGroup->isDescendantOf($group)) {
                throw new \Exception(__('groups.errors.circular_reference'));
            }

            if ($parentGroup->tenant_id !== $data['tenant_id']) {
                throw new \Exception(__('groups.errors.parent_different_tenant'));
            }
        }

        $group->update($data);

        return $group->fresh();
    }

    public function asController(ActionRequest $request, Group $group)
    {
        try {
            $updatedGroup = $this->handle($group, $request->validated());

            return to_route('groups.show', $updatedGroup)
                ->with('success', __('groups.messages.updated'));
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['general' => $e->getMessage()]);
        }
    }
} 