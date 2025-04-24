import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useTranslation } from '@/utils/translation';

export default function GlobalSettingsLayout({ children }: PropsWithChildren) {
    const { __ } = useTranslation();
    
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    
    const sidebarNavItems: NavItem[] = [
        {
            title: __('common.device_types'),
            href: route('global-settings.device-types.index'),
            key: 'device-types',
            icon: null,
        },
        {
            title: __('common.vehicle_types'),
            href: route('global-settings.vehicle-types.index'),
            key: 'vehicle-types',
            icon: null,
        },
        {
            title: __('common.vehicle_brands'),
            href: route('global-settings.vehicle-brands.index'),
            key: 'vehicle-brands',
            icon: null,
        },
        {
            title: __('common.vehicle_models'),
            href: route('global-settings.vehicle-models.index'),
            key: 'vehicle-models',
            icon: null,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading title={__('common.global_settings')} description={__('common.manage_global_settings')} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': item.key ? currentPath.includes(item.key) : false,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
