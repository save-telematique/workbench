import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { UserCog } from 'lucide-react';
import { ReactNode } from 'react';
import { NavItem } from '@/types';
import { DriverResource } from '@/types';

interface DriversLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    driver?: DriverResource;
}

export default function DriversLayout({ children, showSidebar = false, driver }: DriversLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    
    // Only include the driver-specific sidebar items if we have a driverId
    const sidebarNavItems: NavItem[] = [];
    
    // Only add these items if we have a driverId
    if (driver) {
        sidebarNavItems.push(
            {
                title: __('drivers.sidebar.information'),
                href: route('drivers.show', { driver: driver.id }),
                icon: UserCog,
            },
        );
    }

    return (
        <div className="px-4 py-6">
            {showSidebar ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
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
                                        disabled={item.disabled}
                                    >
                                        <Link href={!item.disabled ? item.href : '#'} prefetch>
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