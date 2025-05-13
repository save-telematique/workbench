import { DriverCompactCard } from '@/components/drivers/driver-compact-card';
import FormattedDate from '@/components/formatted-date';
import { ActivityBadge } from '@/components/ui/activity-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LicensePlate } from '@/components/ui/license-plate';
import { cn } from '@/lib/utils';
import { VehicleResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { CalendarClock, Car, ChartBar, MapPin, Route } from 'lucide-react';
import { ReactNode } from 'react';

interface VehiclesLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    vehicle?: VehicleResource;
}

export default function VehiclesLayout({ children, showSidebar = false, vehicle }: VehiclesLayoutProps) {
    const { __ } = useTranslation();

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems = [];

    if (vehicle) {
        sidebarNavItems.push({
            title: __('vehicles.sidebar.information'),
            href: route('vehicles.show', { vehicle: vehicle.id }),
            icon: Car,
        });

        sidebarNavItems.push({
            title: __('vehicles.sidebar.activities'),
            href: route('vehicles.activities', { vehicle: vehicle.id }),
            icon: ChartBar,
        });
    }


    return (
        <div className="px-4 py-6">
            {showSidebar && vehicle ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
                        {/* Vehicle Info Card with License Plate */}
                        <div className="mb-4 flex flex-col items-center">
                            <div className="mb-1 flex w-full justify-center">
                                <LicensePlate
                                    registration={vehicle.registration}
                                    countryCode={vehicle.country}
                                    href={route('vehicles.show', { vehicle: vehicle.id })}
                                    size="md"
                                />
                            </div>

                            {/* Vehicle Model & Type */}
                            <div className="mt-2 flex items-center text-sm">
                                <span className="text-sm font-medium">
                                    {vehicle.vehicle_model?.vehicle_brand?.name} {vehicle.vehicle_model?.name}
                                </span>
                            </div>
                            {vehicle.type && <span className="text-muted-foreground text-xs">{vehicle.type.name}</span>}
                        </div>

                        {/* Vehicle Info */}
                        <Card className="mb-4 py-1">
                            <CardContent className="space-y-2 p-3 ">
                                {/* Current Location */}
                                {vehicle.current_location && (
                                    <div className="flex items-start">
                                        <MapPin className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1 gap-1 flex flex-col">
                                            <div className="text-muted-foreground flex-col items-center justify-between text-xs gap-1">
                                                <FormattedDate date={vehicle.current_location.recorded_at} format="RELATIVE" className="truncate" />
                                                {vehicle.current_location.moving ? (
                                                    <Badge variant="outline" className="ml-1 h-5 border-green-200 bg-green-50 text-xs text-green-700">
                                                        {__('vehicles.sidebar.moving')}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="ml-1 h-5 text-xs">
                                                        {__('vehicles.sidebar.stationary')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <a target="_blank" href={`https://maps.google.com/maps?q=&layer=c&cbll=${vehicle.current_location.latitude},${vehicle.current_location.longitude}&cbp=12,${vehicle.current_location.heading},0,0,0`} className="truncate text-xs font-medium">
                                                {vehicle.current_location.address || __('vehicles.sidebar.unknown_location')}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Current Activity */}
                                {vehicle.current_working_session && (
                                    <div className="flex items-start">
                                        <CalendarClock className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                <FormattedDate date={vehicle.current_working_session.started_at} format="RELATIVE" />
                                            </div>
                                            <div className="mt-0.5">
                                                <ActivityBadge
                                                    activity={vehicle.current_working_session.activity}
                                                    size="sm"
                                                    className="h-5 text-xs font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Device Connection */}
                                {vehicle.device && (
                                    <div className="flex items-start">
                                        <Route className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-medium">{vehicle.device.serial_number}</div>
                                            {vehicle.device.last_contact_at && (
                                                <div className="text-muted-foreground truncate text-xs">
                                                    <FormattedDate date={vehicle.device.last_contact_at} format="RELATIVE" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Current Driver Card */}
                        {vehicle.current_driver && (
                            <div className="mb-4">
                                <Link href={route('drivers.show', { driver: vehicle.current_driver.id })}>
                                    <DriverCompactCard driver={vehicle.current_driver} />
                                </Link>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="mb-1.5 px-1 text-xs font-medium">{__('vehicles.sidebar.navigation')}</div>
                        <nav className="flex flex-col space-y-0.5">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('h-8 w-full justify-start text-sm', {
                                            'bg-muted': item.href.endsWith(currentPath),
                                        })}
                                    >
                                        <Link href={item.href} prefetch>
                                            {Icon && <Icon className="mr-2 h-3.5 w-3.5" />}
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <Separator className="my-6 md:hidden" />

                    <div className="flex-1">
                        <section className="space-y-12">{children}</section>
                    </div>
                </div>
            ) : (
                <div>{children}</div>
            )}
        </div>
    );
}
