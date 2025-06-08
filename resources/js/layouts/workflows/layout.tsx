
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { WorkflowResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Activity, Play, Settings, Workflow } from 'lucide-react';
import { ReactNode } from 'react';
import FormattedDate from '@/components/formatted-date';

interface WorkflowsLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    workflow?: WorkflowResource;
}

export default function WorkflowsLayout({ children, showSidebar = false, workflow }: WorkflowsLayoutProps) {
    const { __ } = useTranslation();

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems = [];

    if (workflow) {
        sidebarNavItems.push({
            title: __('workflows.sidebar.information'),
            href: route('workflows.show', { workflow: workflow.id }),
            icon: Workflow,
        });

        sidebarNavItems.push({
            title: __('workflows.sidebar.executions'),
            href: route('workflows.executions', { workflow: workflow.id }),
            icon: Activity,
        });

        sidebarNavItems.push({
            title: __('workflows.sidebar.settings'),
            href: route('workflows.edit', { workflow: workflow.id }),
            icon: Settings,
        });
    }

    return (
        <div className="px-4 py-6">
            {showSidebar && workflow ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
                        {/* Workflow Info Card */}
                        <Card className="mb-4">
                            <CardContent className="space-y-3 p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium truncate">{workflow.name}</h3>
                                    <Badge variant={workflow.is_active ? "default" : "secondary"}>
                                        {__(workflow.is_active ? 'common.active' : 'common.inactive')}
                                    </Badge>
                                </div>
                                
                                {workflow.description && (
                                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                                )}
                                
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Play className="mr-1 h-4 w-4" />
                                    <span>{__('workflows.execution.last_execution')}: </span>
                                    {workflow.last_execution_at ? (
                                        <FormattedDate date={workflow.last_execution_at} format="RELATIVE" />
                                    ) : (
                                        <span>{__('workflows.execution.never')}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="mb-1.5 px-1 text-xs font-medium">{__('workflows.sidebar.navigation')}</div>
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