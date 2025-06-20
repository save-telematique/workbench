import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/utils/translation';
import { Car, Route, AlertTriangle, Clock, Fuel } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FleetStatsWidgetProps {
    className?: string;
    totalVehicles?: number;
    activeVehicles?: number;
    movingVehicles?: number;
    idlingVehicles?: number;
    parkedVehicles?: number;
    alertsCount?: number;
}

export default function FleetStatsWidget({
    className,
    totalVehicles = 0,
    activeVehicles = 0,
    movingVehicles = 0,
    idlingVehicles = 0,
    parkedVehicles = 0,
    alertsCount = 0,
}: FleetStatsWidgetProps) {
    const { __ } = useTranslation();

    const stats = [
        {
            title: __('vehicles.fleet_stats.total_vehicles'),
            value: totalVehicles,
            icon: Car,
            bgColor: 'bg-blue-100 dark:bg-blue-950',
            textColor: 'text-blue-700 dark:text-blue-300',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: __('vehicles.fleet_stats.moving'),
            value: movingVehicles,
            icon: Route,
            bgColor: 'bg-green-100 dark:bg-green-950',
            textColor: 'text-green-700 dark:text-green-300',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            title: __('vehicles.fleet_stats.idling'),
            value: idlingVehicles,
            icon: Clock,
            bgColor: 'bg-amber-100 dark:bg-amber-950',
            textColor: 'text-amber-700 dark:text-amber-300',
            iconColor: 'text-amber-600 dark:text-amber-400',
        },
        {
            title: __('vehicles.fleet_stats.parked'),
            value: parkedVehicles,
            icon: Fuel,
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-700 dark:text-gray-300',
            iconColor: 'text-gray-600 dark:text-gray-400',
        },
    ];

    if (alertsCount > 0) {
        stats.push({
            title: __('alerts.active_alerts'),
            value: alertsCount,
            icon: AlertTriangle,
            bgColor: 'bg-red-100 dark:bg-red-950',
            textColor: 'text-red-700 dark:text-red-300',
            iconColor: 'text-red-600 dark:text-red-400',
        });
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">{__('vehicles.fleet_stats.title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-lg p-3 sm:p-4 border transition-colors",
                                    stat.bgColor
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", stat.iconColor)} />
                                        <div className="flex flex-col">
                                            <span className={cn("text-lg sm:text-2xl font-bold", stat.textColor)}>
                                                {stat.value}
                                            </span>
                                            <p className={cn("text-xs sm:text-sm font-medium", stat.textColor)}>
                                                {stat.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Active percentage */}
                {totalVehicles > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">
                                {__('vehicles.fleet_stats.active_percentage')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {Math.round((activeVehicles / totalVehicles) * 100)}%
                            </Badge>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.round((activeVehicles / totalVehicles) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 