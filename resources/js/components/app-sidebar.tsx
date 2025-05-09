import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Building2, Users, Settings, Cpu, Car, UserCog, LucideIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from '@/utils/translation';
import { usePermission, useTenantUser } from '@/utils/permissions';

type NavItemConfig = {
    title: string;
    href: string;
    icon: LucideIcon;
    hasPermission?: boolean | null;
    access: 'central' | 'shared' | 'tenant';
};
export function AppSidebar() {
    const { __ } = useTranslation();
    const isTenantUser = useTenantUser();
    
    // Build navigation items based on permissions
    const mainNavItems: NavItem[] = [];


    const navItemsConfig: NavItemConfig[] = [
        {
            title: 'common.dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            access: 'shared'
        },
        {
            title: 'common.tenants', 
            href: '/tenants',
            icon: Building2,
            hasPermission: usePermission('view_tenants'),
            access: 'central'
        },
        {
            title: 'users.list.breadcrumb',
            href: '/users', 
            icon: Users,
            hasPermission: usePermission('view_users'),
            access: 'shared'
        },
        {
            title: 'devices.title',
            href: '/devices',
            icon: Cpu,
            hasPermission: usePermission('view_devices'),
            access: 'central'
        },
        {
            title: 'vehicles.title',
            href: '/vehicles',
            icon: Car,
            hasPermission: usePermission('view_vehicles'),
            access: 'shared'
        },
        {
            title: 'drivers.title',
            href: '/drivers',
            icon: UserCog,
            hasPermission: usePermission('view_drivers'),
            access: 'shared'
        },
        {
            title: 'common.global_settings',
            href: '/global-settings',
            icon: Settings,
            hasPermission: usePermission('view_global_settings'),
            access: 'central'
        }
    ];

    for (const item of navItemsConfig) {
        if (
            (item.hasPermission === undefined || item.hasPermission) && 
            ((isTenantUser && (item.access === 'tenant' || item.access === 'shared')) ||
            (!isTenantUser && (item.access === 'central' || item.access === 'shared')))
        ) {
            mainNavItems.push({
                title: __(item.title),
                href: item.href,
                icon: item.icon
            });
        }
    }

    const footerNavItems: NavItem[] = [];

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
