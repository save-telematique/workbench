import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import { Input } from '@/components/ui/input';
import { useUserColumns } from '@/components/users/user-columns';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { ResourceCollection, UserResource } from '@/types';
import { usePermission } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';
import { useState } from 'react';

interface UsersIndexProps {
    users: ResourceCollection<UserResource>;
}

export default function UsersIndex({ users }: UsersIndexProps) {
    const { __ } = useTranslation();
    const columns = useUserColumns({
        translationNamespace: 'users',
    });
    const canCreateUsers = usePermission('create_users');
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('users.list.breadcrumb'),
            href: route('users.index'),
        },
    ];

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        // Implementation would go here
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.list.title')} />

            <UsersLayout>
                <div className="space-y-6">
                    <DataTable
                        columns={columns}
                        data={users.data || []}
                        tableId="users-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            filtering: true,
                            pageSize: users.meta?.per_page || 10,
                        }}
                        noResultsMessage={__('users.list.no_users')}
                        actionBarLeft={
                            <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
                                <div className="relative w-full">
                                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                    <Input
                                        placeholder={__('common.search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-8"
                                    />
                                </div>
                            </form>
                        }
                        actionBarRight={
                            <div className="flex gap-2">
                                {canCreateUsers && (
                                    <Button asChild size="default" className="h-9">
                                        <Link href={route('users.create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {__('users.list.add_user')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        }
                    />
                </div>
            </UsersLayout>
        </AppLayout>
    );
}
