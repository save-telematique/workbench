import { Head, Link } from '@inertiajs/react';
import { Building2, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import { type Tenant, useTenantsColumns } from './columns';
import { usePermission } from '@/utils/permissions';
import { Input } from '@/components/ui/input';

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface TenantsIndexProps {
    tenants: Tenant[];
}

export default function TenantsIndex({ tenants }: TenantsIndexProps) {
    const { __ } = useTranslation();
    const columns = useTenantsColumns();
    const canCreateTenants = usePermission('create_tenants');
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
    ];
    
    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        // Implementation would go here
    }
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenants.list.title')} />

            <TenantsLayout showSidebar={false}>
                <div className="space-y-6">
                    {tenants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <Building2 className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">{__('tenants.list.no_tenants')}</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">{__('tenants.list.get_started')}</p>
                            <div className="mt-6">
                                {canCreateTenants && (
                                    <Button asChild size="default" className="h-9">
                                        <Link href={route('tenants.create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {__('tenants.list.create_tenant')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={tenants} 
                            tableId="tenants-table"
                            config={{
                                pagination: true,
                                sorting: true,
                                columnManagement: true,
                                saveToPersistence: true
                            }}
                            noResultsMessage={__('tenants.list.no_tenants')}
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
                                    {canCreateTenants && (
                                        <Button asChild size="default" className="h-9">
                                            <Link href={route('tenants.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {__('tenants.list.add_tenant')}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            }
                        />
                    )}
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 