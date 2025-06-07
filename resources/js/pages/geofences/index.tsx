import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/index';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import GeofencesLayout from '@/layouts/geofences/layout';
import { type BreadcrumbItem, GeofenceResource, GroupResource, ResourceCollection, TenantResource } from '@/types';
import { usePermission, useTenantUser } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, MapPin, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useColumns } from './columns';
import GeofenceDrawingMap from "@/components/maps/geofence-drawing-map";

interface GeofencesPageProps {
    geofences: ResourceCollection<GeofenceResource>;
    filters: {
        search?: string;
        tenant_id?: string;
        group_id?: string;
        is_active?: string;
    };
    tenants: TenantResource[];
    groups: GroupResource[];
}

export default function Index({ geofences, filters, tenants, groups }: GeofencesPageProps) {
    const { __ } = useTranslation();
    const isTenantUser = useTenantUser();
    const columns = useColumns();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const canCreateGeofences = usePermission('create_geofences');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('geofences.breadcrumbs.index'),
            href: route('geofences.index'),
        },
    ];

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('geofences.index'), { search: searchTerm, ...filterValues }, { preserveState: true });
    }

    const [filterValues, setFilterValues] = useState({
        tenant_id: filters.tenant_id || 'all',
        group_id: filters.group_id || 'all',
        is_active: filters.is_active || 'all',
    });

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);
        router.get(route('geofences.index'), { ...newFilters, search: searchTerm }, { preserveState: true });
    }

    function resetFilters() {
        setSearchTerm('');
        setFilterValues({
            tenant_id: 'all',
            group_id: 'all',
            is_active: 'all',
        });
        router.get(route('geofences.index'), {}, { preserveState: true });
    }

    // Count active filters for the badge
    const activeFiltersCount = [
        !isTenantUser && filterValues.tenant_id !== 'all',
        filterValues.group_id !== 'all',
        filterValues.is_active !== 'all',
    ].filter(Boolean).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('geofences.title')} />

            <GeofencesLayout showSidebar={false}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                {__('geofences.map.title')}
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({geofences?.data?.length || 0} {__('geofences.map.geofences')})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {geofences?.data && geofences.data.length > 0 ? (
                                <GeofenceDrawingMap
                                    height="400px"
                                    initialGeojson={null}
                                    onGeofenceChange={() => {}} // Read-only mode
                                    showExistingGeofences={true}
                                    existingGeofences={geofences.data.filter(g => g.geojson).map(geofence => ({
                                        id: geofence.id,
                                        name: geofence.name,
                                        geojson: geofence.geojson as GeoJSON.Geometry,
                                        is_active: geofence.is_active
                                    }))}
                                    readonly={true}
                                    onGeofenceClick={(geofence) => {
                                        router.visit(route('geofences.show', { geofence: geofence.id }));
                                    }}
                                    className="[&_.absolute.top-4.left-4]:hidden"
                                />
                            ) : (
                                <div className="bg-muted/20 flex flex-col items-center justify-center rounded-md p-8 text-center">
                                    <MapPin className="text-muted-foreground mb-2 h-10 w-10" />
                                    <h3 className="text-lg font-medium">{__('geofences.map.no_geofences')}</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">{__('geofences.map.no_geofences_description')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <DataTable
                        columns={columns}
                        data={geofences?.data || []}
                        tableId="geofences-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            filtering: true,
                            pageSize: geofences?.meta?.per_page || 10,
                        }}
                        noResultsMessage={__('geofences.list.no_geofences')}
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
                                {canCreateGeofences && (
                                    <Button asChild size="default" className="h-9">
                                        <Link href={route('geofences.create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {__('geofences.actions.create')}
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

                                            {!isTenantUser && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium" htmlFor="tenant-filter">
                                                        {__('geofences.fields.tenant')}
                                                    </label>
                                                    <Select
                                                        value={filterValues.tenant_id}
                                                        onValueChange={(value) => handleFilterChange('tenant_id', value)}
                                                    >
                                                        <SelectTrigger id="tenant-filter" className="w-full">
                                                            <SelectValue placeholder={__('geofences.placeholders.tenant')} />
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

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium" htmlFor="group-filter">
                                                    {__('geofences.fields.group')}
                                                </label>
                                                <Select
                                                    value={filterValues.group_id}
                                                    onValueChange={(value) => handleFilterChange('group_id', value)}
                                                >
                                                    <SelectTrigger id="group-filter" className="w-full">
                                                        <SelectValue placeholder={__('geofences.placeholders.group')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{__('common.all')}</SelectItem>
                                                        {groups.map((group) => (
                                                            <SelectItem key={group.id} value={group.id}>
                                                                {group.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium" htmlFor="status-filter">
                                                    {__('geofences.fields.status')}
                                                </label>
                                                <Select
                                                    value={filterValues.is_active}
                                                    onValueChange={(value) => handleFilterChange('is_active', value)}
                                                >
                                                    <SelectTrigger id="status-filter" className="w-full">
                                                        <SelectValue placeholder={__('geofences.placeholders.status')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{__('common.all')}</SelectItem>
                                                        <SelectItem value="active">{__('geofences.status.active')}</SelectItem>
                                                        <SelectItem value="inactive">{__('geofences.status.inactive')}</SelectItem>
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
                </div>
            </GeofencesLayout>
        </AppLayout>
    );
}
