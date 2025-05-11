import {
    ActivityChangeResource,
    WorkingSessionResource,
} from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import FormattedDate from '@/components/formatted-date';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ActivitiesTableProps {
    data: WorkingSessionResource[] | ActivityChangeResource[];
    type: 'working-sessions' | 'activity-changes';
}

export function ActivitiesTable({ data, type }: ActivitiesTableProps) {
    const { __ } = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);

    // Define columns based on the type
    const columns: ColumnDef<WorkingSessionResource | ActivityChangeResource>[] = type === 'working-sessions'
        ? [
            {
                accessorKey: 'started_at',
                header: __('working_sessions.fields.started_at'),
                cell: ({ row }) => (
                    <FormattedDate
                        date={row.getValue('started_at')}
                        format="PPpp"
                        className="whitespace-nowrap"
                    />
                ),
            },
            {
                accessorKey: 'ended_at',
                header: __('working_sessions.fields.ended_at'),
                cell: ({ row }) => (
                    row.getValue('ended_at')
                        ? <FormattedDate
                            date={row.getValue('ended_at')}
                            format="PPpp"
                            className="whitespace-nowrap"
                        />
                        : <span className="text-muted-foreground italic">{__('common.ongoing')}</span>
                ),
            },
            {
                accessorKey: 'activity.name',
                header: __('working_sessions.fields.activity'),
                cell: ({ row }) => {
                    const session = row.original as WorkingSessionResource;
                    return session.activity?.name || __('common.unknown');
                },
            },
            {
                accessorKey: 'duration',
                header: __('working_sessions.fields.duration'),
                cell: ({ row }) => {
                    const session = row.original as WorkingSessionResource;
                    const duration = session.duration || 0;
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;
                    
                    return (
                        <span>
                            {hours > 0 && `${hours}h `}
                            {minutes}m
                        </span>
                    );
                },
            },
            {
                accessorKey: 'working_day.driver.firstname',
                header: __('working_sessions.fields.driver'),
                cell: ({ row }) => {
                    const session = row.original as WorkingSessionResource;
                    if (session.working_day?.driver) {
                        return `${session.working_day.driver.firstname} ${session.working_day.driver.surname}`;
                    }
                    return __('common.unknown');
                },
            },
        ]
        : [
            {
                accessorKey: 'recorded_at',
                header: __('activity_changes.fields.recorded_at'),
                cell: ({ row }) => (
                    <FormattedDate
                        date={row.getValue('recorded_at')}
                        format="PPpp"
                        className="whitespace-nowrap"
                    />
                ),
            },
            {
                accessorKey: 'activity.name',
                header: __('activity_changes.fields.activity'),
                cell: ({ row }) => {
                    const change = row.original as ActivityChangeResource;
                    return change.activity?.name || __('common.unknown');
                },
            },
            {
                accessorKey: 'type',
                header: __('activity_changes.fields.type'),
                cell: ({ row }) => (
                    <Badge variant="outline">
                        {row.getValue('type')}
                    </Badge>
                ),
            },
            {
                accessorKey: 'working_day.driver.firstname',
                header: __('activity_changes.fields.driver'),
                cell: ({ row }) => {
                    const change = row.original as ActivityChangeResource;
                    if (change.working_day?.driver) {
                        return `${change.working_day.driver.firstname} ${change.working_day.driver.surname}`;
                    }
                    return __('common.unknown');
                },
            },
        ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                {__('common.no_results')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
} 