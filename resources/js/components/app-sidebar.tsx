import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Building2, Users, Settings, Cpu } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from '@/utils/translation';

export function AppSidebar() {
    const { __ } = useTranslation();
    
    const mainNavItems: NavItem[] = [
        {
            title: __('common.dashboard'),
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: __('common.tenants'),
            href: '/tenants',
            icon: Building2,
        },
        {
            title: __('users.list.breadcrumb'),
            href: '/users',
            icon: Users,
        },
        {
            title: __('devices.title'),
            href: '/devices',
            icon: Cpu,
        },
        {
            title: __('common.global_settings'),
            href: '/global-settings',
            icon: Settings,
        },
    ];

    const footerNavItems: NavItem[] = [

    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
