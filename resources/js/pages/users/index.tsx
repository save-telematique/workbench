import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from "@/types";
import { Users, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import { type User, useUserColumns } from '@/components/users/user-columns';
import { usePermission } from '@/utils/permissions';
import { useState } from 'react';
import { Input } from '@/components/ui/input';


interface UsersIndexProps {
    users: User[];
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
                                <Button asChild size="default" className="h-9">
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
                            tableId="users-table"
                            config={{
                                pagination: true,
                                sorting: true,
                                columnManagement: true,
                                saveToPersistence: true
                            }}
                            noResultsMessage={__('users.list.no_users')}
                            actionBarLeft={
                                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                                    <div className="relative w-full">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={__("common.search")}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 w-full"
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
                    )}
                </div>
            </UsersLayout>
        </AppLayout>
    );
} 
