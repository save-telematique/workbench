import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NavItem } from '@/types';
import Heading from '@/components/heading';
import { Info, MessageSquare } from 'lucide-react';

interface DevicesLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    deviceId?: string;
}

export default function DevicesLayout({ 
    children, 
    showSidebar = false, 
    deviceId
}: DevicesLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [
        {
            title: __('devices.tabs.information'),
            href: deviceId ? route('devices.show', deviceId) : '',
            icon: Info,
        },
        {
            title: __('devices.messages.title'),
            href: deviceId ? route('devices.messages.index', deviceId) : '',
            icon: MessageSquare,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading title={__('devices.list.heading')} description={__('devices.list.description')} />
            {showSidebar && deviceId ? (
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