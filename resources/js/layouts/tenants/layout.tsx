import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface TenantsLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    tenantId?: string;
}

export default function TenantsLayout({ children, showSidebar = false, tenantId }: TenantsLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [
        {
            title: __('tenants.tabs.information'),
            href: tenantId ? route('tenants.show', tenantId) : '',
        },
        {
            title: __('tenants.tabs.domains'),
            href: tenantId ? route('tenants.domains.index', tenantId) : '',
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: tenantId ? route('tenants.users.index', tenantId) : '',
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading title={__('tenants.list.heading')} description={__('tenants.list.description')} />
            {showSidebar && tenantId ? (
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
                                        'bg-muted': item.href.endsWith(currentPath),
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
            ) : (
                <div>{children}</div>
            )}
        </div>
    );
}
