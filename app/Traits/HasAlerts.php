<?php

namespace App\Traits;

use App\Models\Alert;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasAlerts
{
    /**
     * Get all alerts for this model.
     */
    public function alerts(): MorphMany
    {
        return $this->morphMany(Alert::class, 'alertable');
    }

    /**
     * Get active alerts for this model.
     */
    public function activeAlerts(): MorphMany
    {
        return $this->morphMany(Alert::class, 'alertable')
            ->active()
            ->orderBy('created_at', 'desc');
    }

    /**
     * Create a new alert for this model using the CreateAlertAction.
     */
    public function createAlert(array $attributes): Alert
    {
        $attributes['alertable_type'] = get_class($this);
        $attributes['alertable_id'] = $this->getKey();
        
        // Set tenant_id if this model has one
        if (method_exists($this, 'tenant') && $this->tenant_id) {
            $attributes['tenant_id'] = $this->tenant_id;
        }
        
        $action = app(\App\Actions\Alerts\CreateAlertAction::class);
        return $action->handle($attributes);
    }

    /**
     * Get unread alerts count for this model for a specific user.
     */
    public function getUnreadAlertsCountForUser(\App\Models\User $user): int
    {
        return \Illuminate\Support\Facades\DB::table('alert_user')
            ->join('alerts', 'alerts.id', '=', 'alert_user.alert_id')
            ->where('alert_user.user_id', $user->id)
            ->whereNull('alert_user.read_at')
            ->where('alerts.is_active', true)
            ->where('alerts.alertable_type', get_class($this))
            ->where('alerts.alertable_id', $this->getKey())
            ->count();
    }

    /**
     * Get alerts for this entity using the GetAlertsAction with proper authorization.
     */
    public function getAlertsForUser(\App\Models\User $user, array $filters = [], int $perPage = 15)
    {
        return app(\App\Actions\Alerts\GetAlertsAction::class)->handle(
            entity: $this,
            user: $user,
            filters: $filters,
            perPage: $perPage
        );
    }
} 