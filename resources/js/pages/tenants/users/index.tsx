import { TenantResource, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { ResourceCollection, UserResource } from '@/types';
import { useTranslation } from '@/utils/translation';
import { useTenantUsersColumns } from './columns';

interface TenantUsersIndexProps {
    tenant: TenantResource;
    users: ResourceCollection<UserResource>;
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
            href: route('tenants.show', { tenant: tenant.id }),
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: route('tenants.users.index', { tenant: tenant.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.list.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenant={tenant}>
                <div className="space-y-6">
                    <HeadingSmall title={__('tenant_users.list.heading')} description={__('tenant_users.list.description')} />
                    <DataTable
                        columns={columns}
                        data={users.data || []}
                        tableId="tenant-users-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            filtering: true,
                            pageSize: users.meta?.per_page || 10,
                        }}
                        noResultsMessage={__('users.list.no_users')}
                        actionBarRight={
                            <Button asChild size="default" className="h-9">
                                <Link href={route('tenants.users.create', { tenant: tenant.id })}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {__('tenant_users.list.add_user')}
                                </Link>
                            </Button>
                        }
                    />
                </div>
            </TenantsLayout>
        </AppLayout>
    );
}
