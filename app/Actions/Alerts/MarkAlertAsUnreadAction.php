<?php

namespace App\Actions\Alerts;

use App\Models\Alert;
use App\Models\User;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class MarkAlertAsUnreadAction
{
    use AsAction;

    public function handle(Alert $alert, User $user): void
    {
        // If user is not assigned to the alert but should have access, assign them
        if (!$alert->users()->where('user_id', $user->id)->exists()) {
            $this->ensureUserAssignedToAlert($alert, $user);
        }
        
        $alert->markAsUnreadFor($user);
    }

    /**
     * Ensure user is assigned to the alert if they should have access
     */
    protected function ensureUserAssignedToAlert(Alert $alert, User $user): void
    {
        // Check if user should have access to this alert based on business rules
        $shouldHaveAccess = false;

        // Super admins always have access
        if ($user->hasRole('super_admin')) {
            $shouldHaveAccess = true;
        }
        // For tenant alerts, check if user belongs to the same tenant and has view_alerts permission
        elseif ($alert->tenant_id && $user->tenant_id === $alert->tenant_id && $user->can('view_alerts')) {
            $shouldHaveAccess = true;
        }
        // For central alerts, check if user is central and has view_alerts permission
        elseif (!$alert->tenant_id && !$user->tenant_id && $user->can('view_alerts')) {
            $shouldHaveAccess = true;
        }

        if ($shouldHaveAccess) {
            $alert->users()->syncWithoutDetaching([
                $user->id => [
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }
    }

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('markAsUnread', $request->route('alert'));
    }

    public function asController(ActionRequest $request, Alert $alert)
    {
        $this->handle($alert, $request->user());

        if ($request->expectsJson()) {
            return response()->json([
                'message' => __('alerts.marked_as_unread'),
                'success' => true,
            ]);
        }

        return back()->with('success', __('alerts.marked_as_unread'));
    }
} 