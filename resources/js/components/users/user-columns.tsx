import { Link } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/utils/translation';
import FormattedDate from '@/components/formatted-date';
import { Badge } from '@/components/ui/badge';

export interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UseUserColumnsParams {
    baseRoute: string;
    tenantId?: string;
    translationNamespace: 'users' | 'tenant_users';
}

export function useUserColumns({
    baseRoute,
    tenantId,
    translationNamespace
}: UseUserColumnsParams): ColumnDef<User>[] {
    const { __ } = useTranslation();

    const getRoute = (action: string, userId: string) => {
        if (tenantId) {
            return route(`${baseRoute}.${action}`, [tenantId, userId]);
        }
        return route(`${baseRoute}.${action}`, userId);
    };

    return [
        {
            accessorKey: 'name',
            header: __(`${translationNamespace}.fields.name`),
        },
        {
            accessorKey: 'email',
            header: __(`${translationNamespace}.fields.email`),
        },
        {
            accessorKey: 'email_verified_at',
            header: __(`${translationNamespace}.fields.email_verified`),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="text-center">
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
            header: __(`${translationNamespace}.fields.created_at`),
            cell: ({ row }) => {
                const user = row.original;
                return <FormattedDate date={user.created_at} format="DATE_MED" />;
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;
                
                return (
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={getRoute('show', user.id)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">{__('common.view')}</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={getRoute('edit', user.id)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">{__('common.edit')}</span>
                            </Link>
                        </Button>
                    </div>
                );
            },
        },
    ];
} 