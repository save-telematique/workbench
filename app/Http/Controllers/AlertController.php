<?php

namespace App\Http\Controllers;

use App\Actions\Alerts\GetAlertsAction;
use App\Http\Resources\Alerts\AlertResource;
use App\Models\Alert;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlertController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Alert::class, 'alert');
    }

    /**
     * Display a listing of alerts.
     */
    public function index(Request $request, GetAlertsAction $action)
    {
        $filters = $request->only([
            'search', 'severity', 'status', 'type', 'alertable_type'
        ]);

        $alerts = $action->handle(
            entity: null,
            user: $request->user(),
            filters: $filters,
            perPage: 15
        );

        return Inertia::render('alerts/index', [
            'alerts' => AlertResource::collection($alerts),
            'filters' => $filters,
        ]);
    }

    /**
     * Display the specified alert.
     */
    public function show(Alert $alert)
    {
        return Inertia::render('alerts/show', [
            'alert' => new AlertResource($alert->load(['creator', 'alertable'])),
        ]);
    }

    /**
     * Get recent alerts for dropdown/widget.
     */
    public function recent(Request $request, GetAlertsAction $action)
    {
        $filters = ['status' => 'unread'];

        $alerts = $action->handle(
            entity: null,
            user: $request->user(),
            filters: $filters,
            perPage: 5
        );

        return response()->json([
            'alerts' => AlertResource::collection($alerts->items()),
            'unread_count' => $alerts->total(),
        ]);
    }

    /**
     * Get alerts for a specific alertable entity.
     */
    public function forEntity(Request $request, GetAlertsAction $action, string $type, string $id)
    {
        // Resolve the entity based on type and id
        $entity = $this->resolveEntity($type, $id);
        
        if (!$entity) {
            return response()->json(['error' => 'Entity not found'], 404);
        }

        // Apply filters from request
        $filters = $request->only(['status', 'severity', 'type']);

        $alerts = $action->handle(
            entity: $entity,
            user: $request->user(),
            filters: $filters,
            perPage: 100 // Higher limit for API endpoint
        );

        return response()->json([
            'alerts' => AlertResource::collection($alerts->items()),
            'total' => $alerts->total(),
        ]);
    }

    /**
     * Resolve entity from type and ID
     */
    protected function resolveEntity(string $type, string $id): ?Model
    {
        $modelMap = [
            'vehicle' => \App\Models\Vehicle::class,
            'driver' => \App\Models\Driver::class,
            'device' => \App\Models\Device::class,
            'user' => \App\Models\User::class,
            'tenant' => \App\Models\Tenant::class,
        ];

        if (!isset($modelMap[$type])) {
            return null;
        }

        $modelClass = $modelMap[$type];
        
        try {
            return $modelClass::find($id);
        } catch (\Exception $e) {
            return null;
        }
    }
} 