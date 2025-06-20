import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AlertResource } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';
import FleetMap from '@/components/maps/fleet-map';
import RecentAlertsWidget from '@/components/alerts/recent-alerts-widget';
import FleetStatsWidget from '@/components/vehicles/fleet-stats-widget';

interface DashboardProps {
    recentAlerts?: AlertResource[];
    fleetStats?: {
        totalVehicles: number;
        activeVehicles: number;
        movingVehicles: number;
        idlingVehicles: number;
        parkedVehicles: number;
    };
}

export default function Dashboard({ 
    recentAlerts = [],
    fleetStats = {
        totalVehicles: 0,
        activeVehicles: 0,
        movingVehicles: 0,
        idlingVehicles: 0,
        parkedVehicles: 0,
    }
}: DashboardProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.dashboard'),
            href: route('dashboard'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Fleet map - increased height */}
                <div className="h-[500px] sm:h-[600px]">
                    <FleetMap 
                        title="vehicles.fleet_map.title" 
                        refreshInterval={60}
                        className="h-full"
                    />
                </div>
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Fleet Stats Widget */}
                    <FleetStatsWidget 
                        totalVehicles={fleetStats.totalVehicles}
                        activeVehicles={fleetStats.activeVehicles}
                        movingVehicles={fleetStats.movingVehicles}
                        idlingVehicles={fleetStats.idlingVehicles}
                        parkedVehicles={fleetStats.parkedVehicles}
                        alertsCount={recentAlerts.length}
                    />
                    
                    {/* Recent Alerts Widget */}
                    <RecentAlertsWidget 
                        alerts={recentAlerts}
                        className="md:col-span-2"
                    />
                </div>
                
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
