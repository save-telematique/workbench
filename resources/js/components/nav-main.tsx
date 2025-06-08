import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const pathname = window.location.href;
    
    const { __ } = useTranslation();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{__('common.platform')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton  
                            asChild isActive={pathname.includes(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.badge && (
                                    <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
