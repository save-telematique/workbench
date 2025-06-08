import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import { useTranslation } from '@/utils/translation';
import { usePermission } from '@/utils/permissions';
import AppLayout from '@/layouts/app-layout';
import WorkflowsLayout from '@/layouts/workflows/layout';
import { useColumns } from './columns';

import type { PageProps, BreadcrumbItem, ResourceCollection } from '@/types';
import type { WorkflowResource } from '@/types/resources';

interface Props extends PageProps {
    workflows: ResourceCollection<WorkflowResource>;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}

export default function WorkflowsIndex({ workflows }: Props) {
    const { __ } = useTranslation();
    const columns = useColumns();
    const canCreateWorkflows = usePermission('create_workflows');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('workflows.breadcrumbs.index'),
            href: route('workflows.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('workflows.title')} />
            
            <WorkflowsLayout showSidebar={false}>
                <DataTable
                    columns={columns}
                    data={workflows?.data || []}
                    tableId="workflows-table"
                    config={{
                        pagination: true,
                        sorting: true,
                        filtering: true,
                        pageSize: workflows?.meta?.per_page || 10,
                    }}
                    noResultsMessage={__('workflows.list.no_workflows')}
                    actionBarRight={
                        <div className="flex gap-2">
                            {canCreateWorkflows && (
                                <Button asChild size="default" className="h-9">
                                    <Link href={route('workflows.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {__('workflows.actions.create')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />
            </WorkflowsLayout>
        </AppLayout>
    );
} 