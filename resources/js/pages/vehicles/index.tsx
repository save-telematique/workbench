import { Head, router, Link } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { DataTable } from "@/components/ui/data-table/index";
import { useColumns } from "./columns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Plus, Car } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePermission } from "@/utils/permissions";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  color: string;
  vin: string;
  year: number;
  tenant?: {
    id: string;
    name: string;
  };
  device?: {
    id: string;
    serial_number: string;
  };
  deleted_at: string | null;
}

interface VehiclesPageProps {
  vehicles: {
    data: Vehicle[];
    links: Record<string, string>;
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      [key: string]: unknown;
    };
  };
  filters: {
    search?: string;
    tenant_id?: string;
    brand?: string;
    has_device?: string;
  };
  brands: string[];
  tenants: { id: string; name: string }[];
}

export default function Index({ vehicles, filters, brands, tenants }: VehiclesPageProps) {
  const { __ } = useTranslation();
  const columns = useColumns();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const canCreateVehicles = usePermission('create_vehicles');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      route('vehicles.index'),
      { search: searchTerm, ...filterValues },
      { preserveState: true }
    );
  }

  const [filterValues, setFilterValues] = useState({
    tenant_id: filters.tenant_id || 'all',
    brand: filters.brand || 'all',
    has_device: filters.has_device || 'all',
  });

  function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    router.get(
      route('vehicles.index'),
      { ...newFilters, search: searchTerm },
      { preserveState: true }
    );
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
  const activeFiltersCount = [
    filterValues.tenant_id !== 'all', 
    filterValues.brand !== 'all',
    filterValues.has_device !== 'all',
  ].filter(Boolean).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.title")} />

      <VehiclesLayout>
        <div className="space-y-6">
          {vehicles?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{__('vehicles.list.no_vehicles')}</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {__('vehicles.list.get_started')}
              </p>
              {canCreateVehicles && (
                <Button asChild>
                  <Link href={route('vehicles.create')}>
                    {__('vehicles.actions.create')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={vehicles?.data || []}
              tableId="vehicles-table"
              config={{
                pagination: true,
                sorting: true,
                filtering: true,
                pageSize: vehicles?.meta?.per_page || 10
              }}
              noResultsMessage={__('vehicles.list.no_vehicles')}
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
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">{__("common.search")}</span>
                  </Button>
                </form>
              }
              actionBarRight={
                <div className="flex gap-2">
                  {canCreateVehicles && (
                    <Button asChild>
                      <Link href={route("vehicles.create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        {__("vehicles.actions.create")}
                      </Link>
                    </Button>
                  )}
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        {__("common.filters")}
                        {activeFiltersCount > 0 && (
                          <span className="ml-2 rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs flex items-center justify-center">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="end">
                      <div className="space-y-4">
                        <h4 className="font-medium">{__("common.filters")}</h4>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="tenant-filter">
                            {__("vehicles.filters.tenant")}
                          </label>
                          <Select
                            value={filterValues.tenant_id}
                            onValueChange={(value) => handleFilterChange("tenant_id", value)}
                          >
                            <SelectTrigger id="tenant-filter" className="w-full">
                              <SelectValue placeholder={__("vehicles.placeholders.tenant")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{__("common.all_tenants")}</SelectItem>
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
                            {__("vehicles.filters.brand")}
                          </label>
                          <Select
                            value={filterValues.brand}
                            onValueChange={(value) => handleFilterChange("brand", value)}
                          >
                            <SelectTrigger id="brand-filter" className="w-full">
                              <SelectValue placeholder={__("vehicles.placeholders.brand")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{__("common.all_brands")}</SelectItem>
                              {brands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="has-device-filter">
                            {__("vehicles.filters.has_device")}
                          </label>
                          <Select
                            value={filterValues.has_device}
                            onValueChange={(value) => handleFilterChange("has_device", value)}
                          >
                            <SelectTrigger id="has-device-filter" className="w-full">
                              <SelectValue placeholder={__("vehicles.placeholders.has_device")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{__("common.all")}</SelectItem>
                              <SelectItem value="yes">{__("common.yes")}</SelectItem>
                              <SelectItem value="no">{__("common.no")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {activeFiltersCount > 0 && (
                          <Button 
                            variant="outline" 
                            onClick={resetFilters} 
                            size="sm"
                            className="w-full mt-4"
                          >
                            <X className="mr-2 h-4 w-4" />
                            {__("common.reset_filters")}
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={resetFilters} 
                      size="sm"
                      className="h-9"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {__("common.reset_filters")}
                    </Button>
                  )}
                </div>
              }
            />
          )}
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 