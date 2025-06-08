import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/utils/translation';
import AppLayout from '@/layouts/app-layout';
import WorkflowsLayout from '@/layouts/workflows/layout';
import WorkflowBuilder from '@/components/workflows/workflow-builder';
import HeadingSmall from '@/components/heading-small';

import type { BreadcrumbItem } from '@/types';

interface PageProps {
    events?: Array<{ key: string; label: string; category: string }>;
    operators?: Array<{ key: string; label: string }>;
    actionTypes?: Array<{ key: string; label: string; category: string }>;
}

export default function WorkflowCreate({ events, operators, actionTypes }: PageProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('workflows.breadcrumbs.index'),
            href: route('workflows.index'),
        },
        {
            title: __('workflows.breadcrumbs.create'),
            href: route('workflows.create'),
        },
    ];

    const handleCancel = () => {
        window.location.href = route('workflows.index');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('workflows.actions.create')} />
            
            <WorkflowsLayout showSidebar={false}>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('workflows.create.heading')} 
                            description={__('workflows.create.description')} 
                        />
                        <Button variant="outline" asChild>
                            <a href={route('workflows.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back')}
                            </a>
                        </Button>
                    </div>

                    {/* Workflow Builder */}
                    <WorkflowBuilder
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