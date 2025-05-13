<?php

namespace App\Http\Controllers\Vehicles;

use App\Http\Controllers\Controller;
use App\Http\Resources\Activities\ActivityResource;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Http\Resources\Drivers\DriverResource;
use App\Http\Resources\WorkingSessions\WorkingSessionResource;
use App\Http\Resources\ActivityChanges\ActivityChangeResource;
use App\Models\Activity;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\WorkingSession;
use App\Models\ActivityChange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VehicleActivitiesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request, Vehicle $vehicle)
    {
        $this->authorize('view', $vehicle);

        // Load related data
        $vehicle->load([
            'tenant',
            'currentDriver',
            'currentLocation',
            'type',
            'model.vehicleBrand',
            'currentWorkingSession.activity',
            'workingSessions' => function ($query) use ($request) {
                $query->with(['activity', 'workingDay.driver'])
                    ->when($request->filled('start_date') && $request->filled('end_date'), function ($q) use ($request) {
                        return $q->whereBetween('started_at', [
                            $request->input('start_date') . ' 00:00:00',
                            $request->input('end_date') . ' 23:59:59'
                        ]);
                    })
                    ->when($request->filled('driver_id'), function ($q) use ($request) {
                        return $q->whereHas('workingDay', function ($query) use ($request) {
                            $query->where('driver_id', $request->input('driver_id'));
                        });
                    })
                    ->when($request->filled('activity_id'), function ($q) use ($request) {
                        return $q->where('activity_id', $request->input('activity_id'));
                    })
                    ->orderBy('started_at', 'desc');
            },
            'activityChanges' => function ($query) use ($request) {
                $query->with(['activity'])
                    ->when($request->filled('start_date') && $request->filled('end_date'), function ($q) use ($request) {
                        return $q->whereBetween('recorded_at', [
                            $request->input('start_date') . ' 00:00:00',
                            $request->input('end_date') . ' 23:59:59'
                        ]);
                    })
                    ->when($request->filled('activity_id'), function ($q) use ($request) {
                        return $q->where('activity_id', $request->input('activity_id'));
                    })
                    ->orderBy('recorded_at', 'desc');
            },
        ]);

        // Prepare filter options
        $drivers = Driver::where('tenant_id', $vehicle->tenant_id)->get();
        $activities = Activity::all();

        // Get summary stats
        $activitySummary = [];
        if ($vehicle->workingSessions->isNotEmpty()) {
            $activitySummary = $vehicle->workingSessions
                ->groupBy('activity.name')
                ->map(function ($sessions) {
                    return [
                        'activity' => $sessions->first()->activity,
                        'total_minutes' => $sessions->sum(function ($session) {
                            $endTime = $session->ended_at ?? now();
                            return $session->started_at->diffInMinutes($endTime);
                        })
                    ];
                })
                ->sortByDesc('total_minutes')
                ->values()
                ->all();
        }

        return Inertia::render('vehicles/activities', [
            'vehicle' => new VehicleResource($vehicle),
            'workingSessions' => WorkingSessionResource::collection($vehicle->workingSessions),
            'activityChanges' => ActivityChangeResource::collection($vehicle->activityChanges),
            'drivers' => DriverResource::collection($drivers),
            'activities' => ActivityResource::collection($activities),
            'activitySummary' => $activitySummary,
            'filters' => $request->only(['start_date', 'end_date', 'driver_id', 'activity_id', 'view_mode']),
        ]);
    }
} 