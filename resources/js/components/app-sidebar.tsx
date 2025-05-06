import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Building2, Users, Settings, Cpu, Car, UserCog } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from '@/utils/translation';
import { usePermission, useTenantUser } from '@/utils/permissions';

export function AppSidebar() {
    const { __ } = useTranslation();
    const isTenantUser = useTenantUser();
    
    // Build navigation items based on permissions
    const mainNavItems: NavItem[] = [];
    
    // Dashboard is available to everyone
    mainNavItems.push({
        title: __('common.dashboard'),
        href: '/dashboard',
        icon: LayoutGrid,
    });
    
    // Tenants - only for central users with view_tenants permission
    if (usePermission('view_tenants') && !isTenantUser) {
        mainNavItems.push({
            title: __('common.tenants'),
            href: '/tenants',
            icon: Building2,
        });
    }
    
    // Users - only for central users with view_users permission
    if (usePermission('view_users') && !isTenantUser) {
        mainNavItems.push({
            title: __('users.list.breadcrumb'),
            href: '/users',
            icon: Users,
        });
    }
    
    // Devices - requires view_devices permission
    if (usePermission('view_devices')) {
        mainNavItems.push({
            title: __('devices.title'),
            href: '/devices',
            icon: Cpu,
        });
    }
    
    // Vehicles - requires view_vehicles permission
    if (usePermission('view_vehicles')) {
        mainNavItems.push({
            title: __('vehicles.title'),
            href: '/vehicles',
            icon: Car,
        });
    }
    
    // Drivers - requires view_drivers permission
    if (usePermission('view_drivers')) {
        mainNavItems.push({
            title: __('drivers.title'),
            href: '/drivers',
            icon: UserCog,
        });
    }
    
    // Global Settings - only for central users with view_global_settings permission
    if (usePermission('view_global_settings') && !isTenantUser) {
        mainNavItems.push({
            title: __('common.global_settings'),
            href: '/global-settings',
            icon: Settings,
        });
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
