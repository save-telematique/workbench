<?php

namespace App\Actions\Groups;

use App\Models\Group;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteGroupAction
{
    use AsAction;

    public function authorize(ActionRequest $request, Group $group): bool
    {
        return $request->user()->can('delete', $group);
    }

    public function handle(Group $group): bool
    {
        // Check if group has child groups
        if ($group->children()->exists()) {
            throw new \Exception(__('groups.errors.has_children'));
        }

        // Check if group has vehicles assigned
        if ($group->vehicles()->exists()) {
            throw new \Exception(__('groups.errors.has_vehicles'));
        }

        // Check if group has drivers assigned
        if ($group->drivers()->exists()) {
            throw new \Exception(__('groups.errors.has_drivers'));
        }

        return $group->delete();
    }

    public function asController(ActionRequest $request, Group $group)
    {
        $this->handle($group);

        return to_route('groups.index')
            ->with('success', __('groups.messages.deleted'));
    }
} 