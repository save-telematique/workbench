<?php

namespace App\Actions\Geofences;

use App\Models\Geofence;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteGeofenceAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->geofence);
    }

    public function handle(Geofence $geofence): bool
    {
        return $geofence->delete();
    }

    public function asController(ActionRequest $request)
    {
        $this->handle($request->geofence);

        return to_route('geofences.index')
            ->with('success', __('geofences.messages.deleted'));
    }
} 