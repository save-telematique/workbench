import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { useStandardActions } from "@/utils/actions";
import { formatDate } from "@/utils/format";
import { WorkflowResource } from "@/types/resources";

export const useColumns = () => {
    const { __ } = useTranslation();
    const getStandardActions = useStandardActions({
        resourceName: "workflows"
    });

    const columns: ColumnDef<WorkflowResource>[] = [
        {
            accessorKey: "name",
            header: "workflows.fields.name",
            enableSorting: true,
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={route('workflows.show', { workflow: row.original.id })}
                        className="font-medium text-primary hover:underline"
                    >
                        {row.original.name}
                    </Link>
                    {row.original.description && (
                        <span className="text-sm text-muted-foreground">
                            {row.original.description}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "is_active",
            header: "workflows.fields.status",
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? __('workflows.status.active') : __('workflows.status.inactive')}
                </Badge>
            ),
        },
        {
            id: "components",
            header: "workflows.fields.components",
            enableSorting: false,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{__('workflows.components.triggers')}: {row.original.triggers_count || 0}</span>
                    <span>{__('workflows.components.conditions')}: {row.original.conditions_count || 0}</span>
                    <span>{__('workflows.components.actions')}: {row.original.actions_count || 0}</span>
                </div>
            ),
        },
        {
            accessorKey: "last_execution_at",
            header: "workflows.fields.last_execution",
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => {
                if (!row.original.last_execution_at) {
                    return <span className="text-muted-foreground">{__('workflows.execution.never')}</span>;
                }
                
                return (
                    <div className="flex flex-col">
                        <span className="text-sm">
                            {formatDate(row.original.last_execution_at)}
                        </span>
                        {row.original.last_execution_status && (
                            <Badge 
                                variant={
                                    row.original.last_execution_status === 'completed' ? 'default' :
                                    row.original.last_execution_status === 'failed' ? 'destructive' :
                                    'secondary'
                                }
                                className="w-fit"
                            >
                                {__(`workflows.execution.status.${row.original.last_execution_status}`)}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "common.fields.created_at",
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => formatDate(row.original.created_at),
        },
        {
            id: "actions",
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => {
                const workflow = { ...row.original, resourceName: "workflows" };
                
                return (
                    <DataTableRowActions
                        row={row}
                        actions={getStandardActions(workflow)}
                        menuLabel={__("common.actions_header")}
                    />
                );
            },
        },
    ];

    return columns;
}; 