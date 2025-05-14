import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import VehiclesLayout from '@/layouts/vehicles/layout';
import { type BreadcrumbItem, ResourceCollection, TenantResource, VehicleBrandResource, VehicleResource } from '@/types';
import { usePermission } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Plus, Search, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useColumns } from './columns';
import FleetMap from '@/components/maps/fleet-map';

interface VehiclesPageProps {
    vehicles: ResourceCollection<VehicleResource>;
    filters: {
        search?: string;
        tenant_id?: string;
        brand?: string;
        has_device?: string;
    };
    brands: VehicleBrandResource[];
    tenants: TenantResource[];
}

export default function Index({ vehicles, filters, brands, tenants }: VehiclesPageProps) {
    const { __ } = useTranslation();
    const columns = useColumns();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const canCreateVehicles = usePermission('create_vehicles');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('vehicles.breadcrumbs.index'),
            href: route('vehicles.index'),
        },
    ];

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('vehicles.index'), { search: searchTerm, ...filterValues }, { preserveState: true });
    }

    const [filterValues, setFilterValues] = useState({
        tenant_id: filters.tenant_id || 'all',
        brand: filters.brand || 'all',
        has_device: filters.has_device || 'all',
    });

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);
        router.get(route('vehicles.index'), { ...newFilters, search: searchTerm }, { preserveState: true });
    }

    function resetFilters() {
        setSearchTerm('');
        setFilterValues({
            tenant_id: 'all',
            brand: 'all',
            has_device: 'all',
        });
        router.get(route('vehicles.index'), {}, { preserveState: true });
    }

    // Count active filters for the badge
    const activeFiltersCount = [filterValues.tenant_id !== 'all', filterValues.brand !== 'all', filterValues.has_device !== 'all'].filter(
        Boolean,
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('vehicles.title')} />

            <VehiclesLayout>
                {/* Fleet map */}
                <FleetMap 
                    title="vehicles.fleet_map.title" 
                    className="mb-6" 
                    refreshInterval={60}
                    onVehicleClick={(vehicle) => {
                        router.visit(route('vehicles.show', { vehicle: vehicle.id }));
                    }}
                />

                <DataTable
                    columns={columns}
                    data={vehicles?.data || []}
                    tableId="vehicles-table"
                    config={{
                        pagination: true,
                        sorting: true,
                        filtering: true,
                        pageSize: vehicles?.meta?.per_page || 10,
                    }}
                    noResultsMessage={__('vehicles.list.no_vehicles')}
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
                            {canCreateVehicles && (
                                <Button asChild size="default" className="h-9">
                                    <Link href={route('vehicles.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {__('vehicles.actions.create')}
                                    </Link>
                                </Button>
                            )}

                            {canCreateVehicles && (
                                <Button asChild variant="outline" size="default" className="h-9">
                                    <Link href={route('vehicles.import')}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {__('vehicles.actions.import')}
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
                                        <h4 className="font-medium">{__('common.filters')}</h4>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="tenant-filter">
                                                {__('vehicles.filters.tenant')}
                                            </label>
                                            <Select value={filterValues.tenant_id} onValueChange={(value) => handleFilterChange('tenant_id', value)}>
                                                <SelectTrigger id="tenant-filter" className="w-full">
                                                    <SelectValue placeholder={__('vehicles.placeholders.tenant')} />
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

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="brand-filter">
                                                {__('vehicles.filters.brand')}
                                            </label>
                                            <Select value={filterValues.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                                                <SelectTrigger id="brand-filter" className="w-full">
                                                    <SelectValue placeholder={__('vehicles.placeholders.brand')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">{__('common.all_brands')}</SelectItem>
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="has-device-filter">
                                                {__('vehicles.filters.has_device')}
                                            </label>
                                            <Select
                                                value={filterValues.has_device}
                                                onValueChange={(value) => handleFilterChange('has_device', value)}
                                            >
                                                <SelectTrigger id="has-device-filter" className="w-full">
                                                    <SelectValue placeholder={__('vehicles.placeholders.has_device')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">{__('common.all')}</SelectItem>
                                                    <SelectItem value="yes">{__('common.yes')}</SelectItem>
                                                    <SelectItem value="no">{__('common.no')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {activeFiltersCount > 0 && (
                                            <Button variant="outline" onClick={resetFilters} size="sm" className="mt-4 w-full">
                                                <X className="mr-2 h-4 w-4" />
                                                {__('common.reset_filters')}
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {activeFiltersCount > 0 && (
                                <Button variant="outline" onClick={resetFilters} size="sm" className="h-9">
                                    <X className="mr-2 h-4 w-4" />
                                    {__('common.reset_filters')}
                                </Button>
                            )}
                        </div>
                    }
                />
            </VehiclesLayout>
        </AppLayout>
    );
}
