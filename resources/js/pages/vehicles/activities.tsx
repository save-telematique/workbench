import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import VehiclesLayout from '@/layouts/vehicles/layout';
import {
    ActivityResource,
    DriverResource,
    VehicleResource,
    WorkingSessionResource,
} from '@/types/resources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { BarChart, Calendar as CalendarIcon, List, ListFilter } from 'lucide-react';
import { ActivitiesFilterBar } from '@/components/vehicles/activities-filter-bar';
import { ActivitiesTable } from '@/components/vehicles/activities-table';
import { ActivitiesTimeline } from '@/components/vehicles/activities-timeline';
import { ActivitiesChart } from '@/components/vehicles/activities-chart';
import { ActivityHorizontalBar } from '@/components/vehicles/activity-horizontal-bar';
import { Badge } from '@/components/ui/badge';
import { DriverCard } from '@/components/drivers/driver-card';

interface ActivitiesPageProps {
    vehicle: VehicleResource;
    workingSessions: WorkingSessionResource[];
    drivers: DriverResource[];
    activities: ActivityResource[];
    activitySummary: Array<{ activity: ActivityResource; total_minutes: number }>;
    filters: {
        start_date?: string;
        end_date?: string;
        driver_id?: string;
        activity_id?: number;
        view_mode?: 'table' | 'timeline' | 'chart';
    };
}

// Helper function to format hours and minutes nicely
const formatTime = (minutes: number): string => {
    // Round to whole minutes
    minutes = Math.round(minutes);
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins}m`;
    }
    
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};


// Get color for an activity
const getActivityColor = (activity: ActivityResource | undefined): string => {
    if (!activity) return '#d1d5db';
    return activity.color || '#d1d5db';
};

// Activity Summary Card Component
const ActivitySummaryCard = ({ activitySummary }: { activitySummary: Array<{ activity: ActivityResource; total_minutes: number }> }) => {
    const { __ } = useTranslation();

    let totalMinutes = 0;
    activitySummary.forEach(activity => {
        totalMinutes += activity.total_minutes;
    });

    // Use useMemo to optimize calculations for better performance - must be before any conditional returns
    const { sortedActivities, exactTotalMinutes } = useMemo(() => {
        // Safety check
        if (!activitySummary || activitySummary.length === 0) {
            return { 
                sortedActivities: [], 
                exactTotalMinutes: 0
            };
        }
        
        // Sort activities by duration (highest first) for better visualization
        const sorted = [...activitySummary].sort((a, b) => b.total_minutes - a.total_minutes);
        
        // Calculate the exact sum of all activities to ensure the total is accurate
        // Use the provided totalMinutes as a fallback if calculation fails
        let exactTotal = sorted.reduce((sum, activity) => sum + (activity.total_minutes || 0), 0);
        
        // If total is invalid, use the provided totalMinutes
        if (isNaN(exactTotal) || exactTotal <= 0) {
            exactTotal = totalMinutes || 0;
        }
        
        return { sortedActivities: sorted, exactTotalMinutes: exactTotal };
    }, [activitySummary, totalMinutes]);

    // If we have empty data, show a placeholder
    if (sortedActivities.length === 0) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="pb-0 pt-0 px-4">
                    <CardTitle className="text-base">{__('vehicles.activities.stats.activity_summary')}</CardTitle>
                    <CardDescription className="text-xs">{__('vehicles.activities.stats.time_summary')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="space-y-2 px-4">
                        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                            {__('common.no_data')}
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="flex items-center justify-between font-bold text-sm">
                                <span>{__('vehicles.activities.stats.total')}</span>
                                <span className="tabular-nums">0m</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-0 px-4">
                <CardTitle className="text-base">{__('vehicles.activities.stats.activity_summary')}</CardTitle>
                <CardDescription className="text-xs">{__('vehicles.activities.stats.time_summary')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-2 px-4">
                    {sortedActivities.map((activity) => (
                        <div key={activity.activity.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <div 
                                    className="h-3 w-3 rounded-full" 
                                    style={{ backgroundColor: getActivityColor(activity.activity) }}
                                />
                                <span className="font-medium">{activity.activity.name}</span>
                            </div>
                            <span className="tabular-nums">{formatTime(activity.total_minutes)} | {Number(activity.total_minutes / exactTotalMinutes * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                    
                    <div className="border-t pt-2 mt-2">
                        <div className="flex items-center justify-between font-bold text-sm">
                            <span>{__('vehicles.activities.stats.total')}</span>
                            <span className="tabular-nums">{formatTime(exactTotalMinutes)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ActivitiesPage({
    vehicle,
    workingSessions,
    drivers,
    activities,
    activitySummary,
    filters,
}: ActivitiesPageProps) {
    const { __ } = useTranslation();
    const [activeViewTab, setActiveViewTab] = useState<string>(filters.view_mode || 'table');

    // Active filters count
    const activeFiltersCount = Object.values(filters).filter(Boolean).length - (filters.view_mode ? 1 : 0);

    const breadcrumbs = [
        { 
            title: __('vehicles.breadcrumbs.index'),
            href: route('vehicles.index')
        },
        { 
            title: vehicle.registration || __('vehicles.breadcrumbs.show'),
            href: route('vehicles.show', { vehicle: vehicle.id })
        },
        { 
            title: __('vehicles.activities.breadcrumb'),
            href: route('vehicles.activities', { vehicle: vehicle.id }),
            active: true
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('vehicles.activities.title')} />

            <VehiclesLayout showSidebar={true} vehicle={vehicle}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {__('vehicles.activities.title_with_vehicle', { registration: vehicle.registration })}
                        </h1>
                        
                        {activeFiltersCount > 0 && (
                            <Badge variant="outline" className="px-3 py-1">
                                <ListFilter className="mr-1 h-3.5 w-3.5" />
                                {__('common.active_filters', { count: activeFiltersCount })}
                            </Badge>
                        )}
                    </div>
                    
                    <ActivitiesFilterBar
                        drivers={drivers}
                        activities={activities}
                        initialFilters={filters}
                    />

                    <Card>
                        <CardContent>
                            <ActivityHorizontalBar 
                                workingSessions={workingSessions}
                                minDuration={2}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-1">
                            <ActivitySummaryCard 
                                activitySummary={activitySummary || []}
                            />
                        </div>

                        {vehicle.current_driver && (
                            <div className="md:col-span-1">
                                <DriverCard driver={vehicle.current_driver} />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">
                                {__('vehicles.activities.tabs.working_sessions')}
                            </h2>

                            <div className="flex space-x-2">
                                <Button
                                    variant={activeViewTab === 'table' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveViewTab('table')}
                                >
                                    <List className="mr-1 h-4 w-4" />
                                    {__('common.views.table')}
                                </Button>
                                <Button
                                    variant={activeViewTab === 'timeline' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveViewTab('timeline')}
                                >
                                    <CalendarIcon className="mr-1 h-4 w-4" />
                                    {__('common.views.timeline')}
                                </Button>
                                <Button
                                    variant={activeViewTab === 'chart' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveViewTab('chart')}
                                >
                                    <BarChart className="mr-1 h-4 w-4" />
                                    {__('common.views.chart')}
                                </Button>
                            </div>
                        </div>

                                {activeViewTab === 'table' && (
                                    <ActivitiesTable
                                        data={workingSessions}
                                        type="working-sessions"
                                    />
                                )}
                                {activeViewTab === 'timeline' && (
                                    <ActivitiesTimeline
                                        data={workingSessions}
                                        type="working-sessions"
                                    />
                                )}
                                {activeViewTab === 'chart' && (
                                    <ActivitiesChart
                                        data={workingSessions}
                                        summary={activitySummary}
                                        type="working-sessions"
                                    />
                                )}
                    </div>
                </div>
            </VehiclesLayout>
        </AppLayout>
    );
} 