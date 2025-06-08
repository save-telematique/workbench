import { Head } from '@inertiajs/react';
import { ArrowLeft, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/utils/translation';
import { WorkflowResource } from '@/types/resources';
import AppLayout from '@/layouts/app-layout';
import WorkflowsLayout from '@/layouts/workflows/layout';
import WorkflowBuilder from '@/components/workflows/workflow-builder';
import HeadingSmall from '@/components/heading-small';

import type { BreadcrumbItem } from '@/types';

interface PageProps {
    workflow: WorkflowResource;
    events?: Array<{ key: string; label: string; category: string }>;
    operators?: Array<{ key: string; label: string }>;
    actionTypes?: Array<{ key: string; label: string; category: string }>;
}

export default function EditWorkflow({ workflow, events, operators, actionTypes }: PageProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('workflows.breadcrumbs.index'),
            href: route('workflows.index'),
        },
        {
            title: workflow.name,
            href: route('workflows.show', { workflow: workflow.id }),
        },
        {
            title: __('workflows.breadcrumbs.edit'),
            href: route('workflows.edit', { workflow: workflow.id }),
        },
    ];

    const handleCancel = () => {
        window.location.href = route('workflows.show', { workflow: workflow.id });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('workflows.edit.heading', { name: workflow.name })} />

            <WorkflowsLayout showSidebar={true} workflow={workflow}>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('workflows.edit.heading', { name: workflow.name })}
                            description={__('workflows.edit.description')}
                        />
                        <div className="flex items-center gap-2">
                            <Badge variant={workflow.is_active ? "default" : "secondary"} className="flex items-center gap-1">
                                {workflow.is_active ? (
                                    <><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {__('common.active')}</>
                                ) : (
                                    <><div className="w-2 h-2 bg-gray-500 rounded-full" /> {__('common.inactive')}</>
                                )}
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                                <a href={route('workflows.show', { workflow: workflow.id })}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {__('common.view')}
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href={route('workflows.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {__('common.back')}
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Workflow Builder */}
                    <WorkflowBuilder
                        workflow={workflow}
                        events={events}
                        operators={operators}
                        actionTypes={actionTypes}
                        onCancel={handleCancel}
                    />
                </div>
            </WorkflowsLayout>
        </AppLayout>
    );
} 