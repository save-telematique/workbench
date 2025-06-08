<?php

namespace App\Actions\Alerts;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class GetUnreadAlertsCountAction
{
    use AsAction;

    public function handle(?User $user = null): int
    {
        $user = $user ?? Auth::user();
        
        if (!$user) {
            return 0;
        }

        return DB::table('alert_user')
            ->join('alerts', 'alerts.id', '=', 'alert_user.alert_id')
            ->where('alert_user.user_id', $user->id)
            ->whereNull('alert_user.read_at')
            ->where('alerts.is_active', true)
            ->count();
    }

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('view_alerts');
    }

    public function asController(ActionRequest $request)
    {
        return response()->json([
            'unread_count' => $this->handle($request->user())
        ]);
    }
} 