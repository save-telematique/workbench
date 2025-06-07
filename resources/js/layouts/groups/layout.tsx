import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GroupResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { Car, FolderTree, Users, UserCheck } from 'lucide-react';
import { ReactNode } from 'react';

interface GroupsLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    group?: GroupResource;
}

export default function GroupsLayout({ children, showSidebar = false, group }: GroupsLayoutProps) {
    const { __ } = useTranslation();

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems = [];

    if (group) {
        sidebarNavItems.push({
            title: __('groups.sidebar.information'),
            href: route('groups.show', { group: group.id }),
            icon: FolderTree,
        });
    }

    return (
        <div className="px-4 py-6">
            {showSidebar && group ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
                        {/* Group Info Card */}
                        <div className="mb-4 flex flex-col items-center">
                            <div className="mb-2 flex w-full justify-center">
                                <div 
                                    className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                                    style={{ backgroundColor: group.color || '#6366f1' }}
                                >
                                    <FolderTree className="h-6 w-6" />
                                </div>
                            </div>

                            {/* Group Name & Path */}
                            <div className="mt-2 flex flex-col items-center text-center">
                                <span className="text-sm font-medium">
                                    {group.name}
                                </span>
                                {group.full_path && group.full_path !== group.name && (
                                    <span className="text-muted-foreground text-xs mt-1">
                                        {group.full_path}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Group Info */}
                        <Card className="mb-4 py-1">
                            <CardContent className="space-y-2 p-3">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                        {__('groups.fields.status')}
                                    </span>
                                    <Badge variant={group.is_active ? "default" : "secondary"} className="h-5 text-xs">
                                        {group.is_active ? __('common.active') : __('common.inactive')}
                                    </Badge>
                                </div>

                                {/* Parent Group */}
                                {group.parent && (
                                    <div className="flex items-start">
                                        <FolderTree className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                {__('groups.fields.parent_group')}
                                            </div>
                                            <Link 
                                                href={route('groups.show', { group: group.parent.id })}
                                                className="truncate text-xs font-medium hover:underline"
                                            >
                                                {group.parent.name}
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Children Count */}
                                {group.children_count > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">
                                            {__('groups.fields.children_count')}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {group.children_count}
                                        </span>
                                    </div>
                                )}

                                {/* Vehicles Count */}
                                {group.vehicles_count > 0 && (
                                    <div className="flex items-start">
                                        <Car className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                {__('groups.fields.vehicles_count')}
                                            </div>
                                            <div className="text-xs font-medium">
                                                {group.vehicles_count}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Drivers Count */}
                                {group.drivers_count > 0 && (
                                    <div className="flex items-start">
                                        <UserCheck className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                {__('groups.fields.drivers_count')}
                                            </div>
                                            <div className="text-xs font-medium">
                                                {group.drivers_count}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Users Count */}
                                {group.users_count > 0 && (
                                    <div className="flex items-start">
                                        <Users className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                {__('groups.fields.users_count')}
                                            </div>
                                            <div className="text-xs font-medium">
                                                {group.users_count}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="mb-1.5 px-1 text-xs font-medium">{__('groups.sidebar.navigation')}</div>
                        <nav className="flex flex-col space-y-0.5">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('h-8 w-full justify-start text-sm', {
                                            'bg-muted': item.href.endsWith(currentPath),
                                        })}
                                    >
                                        <Link href={item.href} prefetch>
                                            {Icon && <Icon className="mr-2 h-3.5 w-3.5" />}
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