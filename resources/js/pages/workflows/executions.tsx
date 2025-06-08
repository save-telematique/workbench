import { Head } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, AlertCircle, Play } from 'lucide-react';

import { useTranslation } from '@/utils/translation';
import { WorkflowResource, WorkflowExecutionResource, ResourceCollection } from '@/types/resources';
import AppLayout from '@/layouts/app-layout';
import WorkflowsLayout from '@/layouts/workflows/layout';
import HeadingSmall from '@/components/heading-small';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import FormattedDate from '@/components/formatted-date';

import type { BreadcrumbItem } from '@/types';

interface PageProps {
    workflow: WorkflowResource;
    executions: ResourceCollection<WorkflowExecutionResource>;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'completed':
            return 'default' as const; // Using default as success variant doesn't exist
        case 'failed':
            return 'destructive' as const;
        case 'running':
            return 'default' as const;
        case 'pending':
            return 'secondary' as const;
        default:
            return 'secondary' as const;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return CheckCircle;
        case 'failed':
            return XCircle;
        case 'running':
            return Play;
        case 'pending':
            return Clock;
        default:
            return AlertCircle;
    }
};

export default function WorkflowExecutions({ workflow, executions }: PageProps) {
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
            title: __('workflows.breadcrumbs.executions'),
            href: route('workflows.executions', { workflow: workflow.id }),
        },
    ];

    const columns: ColumnDef<WorkflowExecutionResource>[] = [
        {
            accessorKey: 'id',
            header: 'workflows.executions.fields.id',
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.id.substring(0, 8)}...
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'workflows.executions.fields.status',
            cell: ({ row }) => {
                const status = row.original.status;
                const StatusIcon = getStatusIcon(status);
                return (
                    <Badge variant={getStatusBadgeVariant(status)} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {__(`workflows.execution.status.${status}`)}
                    </Badge>
                );
            },
        },
        {
            accessorFn: (row) => row.started_at,
            id: 'started_at',
            header: 'workflows.executions.fields.started_at',
            cell: ({ row }) => (
                <div>
                    {row.original.started_at ? (
                        <FormattedDate date={row.original.started_at} format="DATETIME" />
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.completed_at,
            id: 'completed_at',
            header: 'workflows.executions.fields.completed_at',
            cell: ({ row }) => (
                <div>
                    {row.original.completed_at ? (
                        <FormattedDate date={row.original.completed_at} format="DATETIME" />
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.duration ?? 0,
            id: 'duration',
            header: 'workflows.executions.fields.duration',
            cell: ({ row }) => (
                <div>
                    {row.original.duration ? (
                        <span>{row.original.duration.toFixed(2)}s</span>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.triggered_by ?? '',
            id: 'triggered_by',
            header: 'workflows.executions.fields.triggered_by',
            cell: ({ row }) => (
                <div>
                    {row.original.triggered_by ? (
                        <span className="text-sm">{row.original.triggered_by}</span>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.error_message ?? '',
            id: 'error_message',
            header: 'workflows.executions.fields.error_message',
            cell: ({ row }) => (
                <div>
                    {row.original.error_message ? (
                        <span className="text-sm text-red-600 truncate max-w-xs" title={row.original.error_message}>
                            {row.original.error_message}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('workflows.executions.heading', { name: workflow.name })} />

            <WorkflowsLayout showSidebar={true} workflow={workflow}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('workflows.executions.heading', { name: workflow.name })}
                        description={__('workflows.executions.description')}
                    />

                    <DataTable
                        columns={columns}
                        data={executions.data}
                        tableId="workflow-executions-table"
                        config={{
                            pagination: true,
                            sorting: true,
                        }}
                        noResultsMessage={__('workflows.executions.no_executions')}
                    />
                </div>
            </WorkflowsLayout>
        </AppLayout>
    );
} 