import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { NavItem, TenantResource } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface TenantsLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    tenant?: TenantResource;
}

export default function TenantsLayout({ children, showSidebar = false, tenant }: TenantsLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [];

    if (tenant) {
        sidebarNavItems.push(
            {
                title: __('tenants.tabs.information'),
                href: route('tenants.show', { tenant: tenant.id }),
            },
            {
                title: __('tenants.tabs.domains'),
                href: route('tenants.domains.index', { tenant: tenant.id }),
            },
            {
                title: __('tenant_users.list.breadcrumb'),
                href: route('tenants.users.index', { tenant: tenant.id }),
            }
        );
    }

    return (
        <div className="px-4 py-6">
            <Heading title={__('tenants.list.heading')} description={__('tenants.list.description')} />
            {showSidebar && tenant ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
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
                                    disabled={item.disabled}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
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
