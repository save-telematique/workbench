import { Head, Link } from '@inertiajs/react';
import { Users, Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import { DataTable } from '@/components/ui/data-table/index';
import { type TenantUser, useTenantUsersColumns } from './columns';

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface TenantUsersIndexProps {
    tenant: {
        id: string;
        name: string;
    };
    users: TenantUser[];
}

export default function TenantUsersIndex({ tenant, users }: TenantUsersIndexProps) {
    const { __ } = useTranslation();
    const columns = useTenantUsersColumns(tenant.id);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
        {
            title: __('tenants.show.breadcrumb', { name: tenant.name }),
            href: route('tenants.show', tenant.id),
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: route('tenants.users.index', tenant.id),
        },
    ];
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.list.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenant_users.list.heading')} 
                        description={__('tenant_users.list.description')} 
                    />

                    {users.length === 0 ? (
                        <div className="rounded-lg border bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="flex flex-col items-center justify-center">
                                <Users className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{__('tenant_users.list.no_users')}</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{__('tenant_users.list.get_started')}</p>
                                <div className="mt-6">
                                    <Button asChild size="default" className="h-9">
                                        <Link href={route('tenants.users.create', tenant.id)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {__('tenant_users.list.create_user')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={users} 
                            tableId="tenant-users-table"
                            config={{
                                pagination: true,
                                sorting: true
                            }}
                            noResultsMessage={__('users.list.no_users')}
                            actionBarRight={
                                <Button asChild size="default" className="h-9">
                                    <Link href={route('tenants.users.create', tenant.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {__('tenant_users.list.add_user')}
                                    </Link>
                                </Button>
                            }
                        />
                    )}
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 