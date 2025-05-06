import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import { type User, useUserColumns } from '@/components/users/user-columns';
import { usePermission } from '@/utils/permissions';

interface UsersIndexProps {
    users: User[];
}

export default function UsersIndex({ users }: UsersIndexProps) {
    const { __ } = useTranslation();
    const columns = useUserColumns({
        translationNamespace: 'users',
    });
    const canCreateUsers = usePermission('create_users');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('users.list.breadcrumb'),
            href: route('users.index'),
        },
    ];
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.list.title')} />

            <UsersLayout>
                <div className="space-y-6">
                    
                    <div className="flex justify-end">
                        {canCreateUsers && (
                            <Button asChild>
                                <Link href={route('users.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {__('users.list.add_user')}
                                </Link>
                            </Button>
                        )}
                    </div>
                    
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">{__('users.list.no_users')}</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                {__('users.list.get_started')}
                            </p>
                            {canCreateUsers && (
                                <Button asChild>
                                    <Link href={route('users.create')}>
                                        {__('users.list.create_user')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={users}
                        />
                    )}
                </div>
            </UsersLayout>
        </AppLayout>
    );
} 