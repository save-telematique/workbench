import { type NavItem } from '@/types';
import { Building2, Car, Cpu, LayoutGrid, LucideIcon, Settings, UserCog, Users } from 'lucide-react';
import { usePermission, useTenantUser } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';

type NavItemConfig = {
    title: string;
    href: string;
    icon: LucideIcon;
    shortcut?: string;
    hasPermission?: boolean | null;
    access: 'central' | 'shared' | 'tenant';
};

export function useNavItems(): NavItem[] {
    const { __ } = useTranslation();
    const isTenantUser = useTenantUser();
    
    // Build navigation items based on permissions
    const mainNavItems: NavItem[] = [];

    const navItemsConfig: NavItemConfig[] = [
        {
            title: 'common.dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            shortcut: '1',
            access: 'shared'
        },
        {
            title: 'common.tenants', 
            href: '/tenants', 
            icon: Building2,
            shortcut: '2',
            hasPermission: usePermission('view_tenants'),
            access: 'central'
        },
        {
            title: 'users.list.breadcrumb',
            href: '/users', 
            icon: Users,
            shortcut: '3',
            hasPermission: usePermission('view_users'),
            access: 'shared'
        },
        {
            title: 'devices.title',
            href: '/devices',
            icon: Cpu,
            shortcut: '4',
            hasPermission: usePermission('view_devices'),
            access: 'central'
        },
        {
            title: 'vehicles.title',
            href: '/vehicles', 
            icon: Car,
            shortcut: '5',
            hasPermission: usePermission('view_vehicles'),
            access: 'shared'
        },
        {
            title: 'drivers.title',
            href: '/drivers',
            icon: UserCog,
            shortcut: '6',
            hasPermission: usePermission('view_drivers'),
            access: 'shared'
        },
        {
            title: 'common.global_settings',
            href: '/global-settings/device-types',
            icon: Settings,
            shortcut: '7',
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
                icon: item.icon,
                shortcut: item.shortcut
            });
        }
    }

    return mainNavItems;
} 