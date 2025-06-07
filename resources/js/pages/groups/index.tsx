import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import GroupsLayout from '@/layouts/groups/layout';
import { type BreadcrumbItem, ResourceCollection, TenantResource, GroupResource } from '@/types';
import { usePermission, useTenantUser } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useColumns } from './columns';

interface GroupsPageProps {
    groups: ResourceCollection<GroupResource>;
    filters: {
        search?: string;
        tenant_id?: string;
        parent_id?: string;
        is_active?: string;
    };
    tenants: TenantResource[];
    groupsForFilter: GroupResource[];
}

export default function Index({ groups, filters, tenants, groupsForFilter }: GroupsPageProps) {
    const { __ } = useTranslation();
    const columns = useColumns();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const canCreateGroups = usePermission('create_groups');
    const isTenantUser = useTenantUser();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('groups.breadcrumbs.index'),
            href: route('groups.index'),
        },
    ];

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('groups.index'), { search: searchTerm, ...filterValues }, { preserveState: true });
    }

    const [filterValues, setFilterValues] = useState({
        tenant_id: filters.tenant_id || 'all',
        parent_id: filters.parent_id || 'all',
        is_active: filters.is_active || 'all',
    });

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);
        router.get(route('groups.index'), { ...newFilters, search: searchTerm }, { preserveState: true });
    }

    function resetFilters() {
        setSearchTerm('');
        setFilterValues({
            tenant_id: 'all',
            parent_id: 'all',
            is_active: 'all',
        });
        router.get(route('groups.index'), {}, { preserveState: true });
    }

    // Count active filters for the badge
    const activeFiltersCount = [
        filterValues.tenant_id !== 'all', 
        filterValues.parent_id !== 'all', 
        filterValues.is_active !== 'all'
    ].filter(Boolean).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('groups.title')} />

            <GroupsLayout>
                <DataTable
                    columns={columns}
                    data={groups?.data || []}
                    tableId="groups-table"
                    config={{
                        pagination: true,
                        sorting: true,
                        filtering: true,
                        pageSize: groups?.meta?.per_page || 10,
                    }}
                    noResultsMessage={__('groups.list.no_groups')}
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
                            <Button type="submit" size="icon" variant="outline">
                                <Search className="h-4 w-4" />
                                <span className="sr-only">{__('common.search')}</span>
                            </Button>
                        </form>
                    }
                    actionBarRight={
                        <div className="flex gap-2">
                            {canCreateGroups && (
                                <Button asChild size="default" className="h-9">
                                    <Link href={route('groups.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {__('groups.actions.create')}
                                    </Link>
                                </Button>
                            )}

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="default" className="h-9">
                                        <Filter className="mr-2 h-4 w-4" />
                                        {__('common.filters')}
                                        {activeFiltersCount > 0 && (
                                            <span className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                                                {activeFiltersCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{__('common.filters')}</h4>
                                            {activeFiltersCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                    className="h-8 px-2 lg:px-3"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    {__('common.reset')}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Tenant Filter (only for central users) */}
                                        {!isTenantUser && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium" htmlFor="tenant-filter">
                                                    {__('groups.filters.tenant')}
                                                </label>
                                                <Select value={filterValues.tenant_id} onValueChange={(value) => handleFilterChange('tenant_id', value)}>
                                                    <SelectTrigger id="tenant-filter" className="w-full">
                                                        <SelectValue placeholder={__('groups.placeholders.tenant')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{__('common.all_tenants')}</SelectItem>
                                                        {tenants.map((tenant) => (
                                                            <SelectItem key={tenant.id} value={tenant.id}>
                                                                {tenant.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Parent Group Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="parent-filter">
                                                {__('groups.filters.parent_group')}
                                            </label>
                                            <Select value={filterValues.parent_id} onValueChange={(value) => handleFilterChange('parent_id', value)}>
                                                <SelectTrigger id="parent-filter" className="w-full">
                                                    <SelectValue placeholder={__('groups.placeholders.parent_group')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">{__('common.all_groups')}</SelectItem>
                                                    <SelectItem value="root">{__('groups.filters.root_groups')}</SelectItem>
                                                    {groupsForFilter.map((group) => (
                                                        <SelectItem key={group.id} value={group.id}>
                                                            {group.full_path || group.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="status-filter">
                                                {__('groups.filters.status')}
                                            </label>
                                            <Select
                                                value={filterValues.is_active}
                                                onValueChange={(value) => handleFilterChange('is_active', value)}
                                            >
                                                <SelectTrigger id="status-filter" className="w-full">
                                                    <SelectValue placeholder={__('groups.placeholders.status')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">{__('common.all_statuses')}</SelectItem>
                                                    <SelectItem value="true">{__('common.active')}</SelectItem>
                                                    <SelectItem value="false">{__('common.inactive')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    }
                />
            </GroupsLayout>
        </AppLayout>
    );
} 