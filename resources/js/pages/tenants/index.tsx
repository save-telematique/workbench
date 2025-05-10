import { Head, Link } from '@inertiajs/react';
import { TenantResource, ResourceCollection, type BreadcrumbItem } from "@/types";
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import { useTenantsColumns } from './columns';
import { usePermission } from '@/utils/permissions';
import { Input } from '@/components/ui/input';


interface TenantsIndexProps {
    tenants: ResourceCollection<TenantResource>;
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
                        <DataTable 
                            columns={columns} 
                            data={tenants.data || []} 
                            tableId="tenants-table"
                            config={{
                                pagination: true,
                                sorting: true,
                                filtering: true,
                                pageSize: tenants.meta?.per_page || 10,
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
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 
