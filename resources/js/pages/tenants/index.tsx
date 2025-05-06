import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import { type Tenant, useTenantsColumns } from './columns';
import { usePermission } from '@/utils/permissions';

interface TenantsIndexProps {
    tenants: Tenant[];
}

export default function TenantsIndex({ tenants }: TenantsIndexProps) {
    const { __ } = useTranslation();
    const columns = useTenantsColumns();
    const canCreateTenants = usePermission('create_tenants');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
    ];
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenants.list.title')} />

            <TenantsLayout showSidebar={false}>
                <div className="space-y-6">
                  
                    <div className="flex justify-end">
                        {canCreateTenants && (
                            <Button asChild >
                                <Link href={route('tenants.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {__('tenants.list.add_tenant')}
                                </Link>
                            </Button>
                        )}
                    </div>

                    {tenants.length === 0 ? (
                        <div className="rounded-lg border bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="flex flex-col items-center justify-center">
                                <Building2 className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{__('tenants.list.no_tenants')}</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{__('tenants.list.get_started')}</p>
                                <div className="mt-6">
                                    {canCreateTenants && (
                                        <Button asChild>
                                            <Link href={route('tenants.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {__('tenants.list.create_tenant')}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={tenants} 
                            pagination={true}
                            sorting={true}
                            noResultsMessage={__('tenants.list.no_tenants')}
                        />
                    )}
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 