<?php

namespace App\Http\Controllers;

use App\Actions\Alerts\GetAlertsAction;
use App\Http\Resources\Alerts\AlertResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request, GetAlertsAction $getAlertsAction): Response
    {
        // Get recent alerts (last 5 for the widget)
        $recentAlerts = $getAlertsAction->handle(
            entity: null,
            user: $request->user(),
            filters: [],
            perPage: 5
        );

        return Inertia::render('dashboard', [
            'recentAlerts' => AlertResource::collection($recentAlerts->items()),
        ]);
    }
} 