import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle } from 'lucide-react';

import { useTranslation } from '@/utils/translation';
import FormattedDate from '@/components/formatted-date';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from '@/components/ui/data-table';
import { useStandardActions } from '@/utils/actions';
import { UserResource } from '@/types';
export interface UseUserColumnsParams {
    tenantId?: string;
    translationNamespace: 'users' | 'tenant_users';
}

export function useUserColumns({
    translationNamespace,
    tenantId,
}: UseUserColumnsParams): ColumnDef<UserResource>[] {
    const { __ } = useTranslation();
    const getStandardActions = useStandardActions({
        resourceName: "users",
        routePrefix: translationNamespace === "tenant_users" ? "tenants.users" : null,
        additionalParams: tenantId ? {
            tenant: tenantId,
        } : {},
    });
    
    return [
        {
            accessorKey: 'name',
            header: `${translationNamespace}.fields.name`,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'email',
            header: `${translationNamespace}.fields.email`,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorFn: (row) => row.email_verified_at ? 1 : 0,
            id: 'email_verified_at',
            header: `${translationNamespace}.fields.email_verified`,
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div>
                        {user.email_verified_at ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {__(`${translationNamespace}.fields.email_verified_badge`)}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                {__(`${translationNamespace}.fields.email_not_verified_badge`)}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: `${translationNamespace}.fields.created_at`,
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => {
                const user = row.original;
                return <FormattedDate date={user.created_at} format="DATE_MED" />;
            },
        },
        {
            id: "actions",
            enableHiding: false,
            enableSorting: false,
            cell: ({ row }) => {
              const user = { ...row.original, resourceName: "users" };
              
              return (
                <DataTableRowActions
                  row={row}
                  actions={getStandardActions(user)}
                  menuLabel={__("common.actions_header")}
                />
              );
            },
        },
    ];
} 