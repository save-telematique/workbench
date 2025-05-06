import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { UserCog, Settings, FileText, Users } from 'lucide-react';
import { ReactNode } from 'react';

interface DriversLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    driverId?: string;
}

export default function DriversLayout({ children, showSidebar = false, driverId }: DriversLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    
    // Only include the driver-specific sidebar items if we have a driverId
    const sidebarNavItems = [];
    
    // Always include the drivers list item
    sidebarNavItems.push({
        title: __('drivers.sidebar.list'),
        href: route('drivers.index'),
        icon: Users,
    });
    
    // Only add these items if we have a driverId
    if (driverId) {
        sidebarNavItems.push(
            {
                title: __('drivers.sidebar.information'),
                href: route('drivers.show', driverId),
                icon: UserCog,
            },
            {
                title: __('drivers.sidebar.license'),
                href: '#',
                icon: FileText,
                disabled: true,
            },
            {
                title: __('drivers.sidebar.settings'),
                href: '#',
                icon: Settings,
                disabled: true,
            }
        );
    }

    return (
        <div className="px-4 py-6">
            <Heading title={__('drivers.list.heading')} description={__('drivers.list.description')} />
            {showSidebar ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
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
                                            'bg-muted': !item.disabled && item.href.endsWith(currentPath),
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