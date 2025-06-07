import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { GroupResource } from '@/types/resources';
import { useStandardActions } from '@/utils/actions';
import { useTranslation } from '@/utils/translation';
import { useTenantUser } from '@/utils/permissions';
import { Link } from '@inertiajs/react';
import { FolderTree } from 'lucide-react';

export function useColumns(): ColumnDef<GroupResource>[] {
    const { __ } = useTranslation();
    const isTenantUser = useTenantUser();
    
    const getStandardActions = useStandardActions({
        resourceName: "groups",
        routePrefix: "groups",
    });

    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.name')} />
            ),
            cell: ({ row }) => {
                const group = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div 
                            className="flex h-8 w-8 items-center justify-center rounded text-white text-xs"
                            style={{ backgroundColor: group.color || '#6366f1' }}
                        >
                            <FolderTree className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <Button variant="link" asChild className="h-auto p-0 text-left font-medium">
                                <Link href={route('groups.show', { group: group.id })}>
                                    {group.name}
                                </Link>
                            </Button>
                            {group.full_path && group.full_path !== group.name && (
                                <span className="text-muted-foreground text-xs">
                                    {group.full_path}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
            meta: {
                title: __('groups.fields.name'),
            },
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.description')} />
            ),
            cell: ({ row }) => {
                const description = row.getValue('description') as string;
                return description ? (
                    <span className="text-muted-foreground text-sm">
                        {description.length > 50 ? `${description.substring(0, 50)}...` : description}
                    </span>
                ) : (
                    <span className="text-muted-foreground text-sm italic">
                        {__('common.no_description')}
                    </span>
                );
            },
            meta: {
                title: __('groups.fields.description'),
            },
            enableSorting: false,
            enableHiding: true,
        },
        {
            accessorKey: 'parent',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.parent_group')} />
            ),
            cell: ({ row }) => {
                const group = row.original;
                return group.parent ? (
                    <Button variant="link" asChild className="h-auto p-0 text-left">
                        <Link href={route('groups.show', { group: group.parent.id })}>
                            {group.parent.name}
                        </Link>
                    </Button>
                ) : (
                    <span className="text-muted-foreground text-sm italic">
                        {__('groups.options.no_parent')}
                    </span>
                );
            },
            meta: {
                title: __('groups.fields.parent_group'),
            },
            enableSorting: false,
            enableHiding: true,
        },
        // Only show tenant column for central users
        ...(!isTenantUser ? [{
            accessorFn: (row: GroupResource) => row.tenant?.name ?? "",
            id: "tenant",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.tenant')} />
            ),
            cell: ({ row }) => {
                const group = row.original;
                return group.tenant ? (
                    <Button variant="link" asChild className="h-auto p-0 text-left">
                        <Link href={route('tenants.show', { tenant: group.tenant.id })}>
                            {group.tenant.name}
                        </Link>
                    </Button>
                ) : (
                    <span className="text-muted-foreground text-sm italic">
                        {__('common.no_tenant')}
                    </span>
                );
            },
            meta: {
                title: __('groups.fields.tenant'),
            },
            enableSorting: false,
            enableHiding: true,
        } as ColumnDef<GroupResource>] : []),
        {
            accessorKey: 'children_count',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.children_count')} />
            ),
            cell: ({ row }) => {
                const count = row.getValue('children_count') as number;
                return (
                    <span className="text-sm font-medium">
                        {count}
                    </span>
                );
            },
            meta: {
                title: __('groups.fields.children_count'),
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'vehicles_count',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.vehicles_count')} />
            ),
            cell: ({ row }) => {
                const count = row.getValue('vehicles_count') as number;
                return (
                    <span className="text-sm font-medium">
                        {count}
                    </span>
                );
            },
            meta: {
                title: __('groups.fields.vehicles_count'),
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'drivers_count',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.drivers_count')} />
            ),
            cell: ({ row }) => {
                const count = row.getValue('drivers_count') as number;
                return (
                    <span className="text-sm font-medium">
                        {count}
                    </span>
                );
            },
            meta: {
                title: __('groups.fields.drivers_count'),
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'is_active',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('groups.fields.status')} />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean;
                return (
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? __('common.active') : __('common.inactive')}
                    </Badge>
                );
            },
            meta: {
                title: __('groups.fields.status'),
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={__('common.created_at')} />
            ),
            cell: ({ row }) => {
                const date = row.getValue('created_at') as string;
                return date ? new Date(date).toLocaleDateString() : '';
            },
            meta: {
                title: __('common.created_at'),
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            id: 'actions',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => {
                const group = { ...row.original, resourceName: "groups" };
                
                return (
                    <DataTableRowActions
                        row={row}
                        actions={getStandardActions(group)}
                        menuLabel={__("common.actions_header")}
                    />
                );
            },
        },
    ];
} 