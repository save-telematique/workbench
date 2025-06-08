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
        $alert->markAsUnreadFor($user);
    }

    public function authorize(ActionRequest $request, Alert $alert): bool
    {
        return $request->user()->can('markAsUnread', $alert);
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