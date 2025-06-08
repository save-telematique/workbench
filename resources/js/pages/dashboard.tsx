import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AlertResource } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';
import FleetMap from '@/components/maps/fleet-map';
import RecentAlertsWidget from '@/components/alerts/recent-alerts-widget';

interface DashboardProps {
    recentAlerts?: AlertResource[];
}

export default function Dashboard({ recentAlerts = [] }: DashboardProps) {
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
                {/* Fleet map */}
                <FleetMap 
                    title="vehicles.fleet_map.title" 
                    refreshInterval={60}
                />
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Recent Alerts Widget */}
                    <RecentAlertsWidget 
                        alerts={recentAlerts}
                        className="md:col-span-1"
                    />
                    
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
