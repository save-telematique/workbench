import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { User, Shield } from 'lucide-react';
import { ReactNode } from 'react';
import { NavItem, UserResource } from '@/types';

export interface UsersLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    user?: UserResource;
}

export default function UsersLayout({ children, showSidebar = false, user }: UsersLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems: NavItem[] = [];

    if (user) {
        sidebarNavItems.push(
            {
                title: __('users.sidebar.information'),
                href: route('users.show', { user: user.id }),
                icon: User,
            },
            {
                title: __('users.sidebar.roles'),
                href: route('users.roles.edit', { user: user.id }),
                icon: Shield,
            },
        );
    }
    
    return (
        <div className="px-4 py-6">
            <Heading title={__('users.list.heading')} description={__('users.list.description')} />
            {showSidebar && user ? (
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
