import { DriverCompactCard } from '@/components/drivers/driver-compact-card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VehicleResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { Car, ChartBar } from 'lucide-react';
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
    const sidebarNavItems = [
    ];
    
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
            <Heading title={__('vehicles.list.heading')} description={__('vehicles.list.description')} />
            {showSidebar && vehicle ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
                        {vehicle.current_driver && (
                            <Link href={route('drivers.show', { driver: vehicle.current_driver.id })}>
                                <DriverCompactCard className="mb-4" driver={vehicle.current_driver} />
                            </Link>
                        )}
                        <nav className="flex flex-col space-y-1 space-x-0">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('w-full justify-start', {
                                            'bg-muted': item.href.endsWith(currentPath),
                                        })}
                                    >
                                        <Link href={item.href} prefetch>
                                            {Icon && <Icon className="mr-2 h-4 w-4" />}
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
