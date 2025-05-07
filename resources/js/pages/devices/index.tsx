import { Head, router } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "@/utils/translation";
import { DataTable } from "@/components/ui/data-table/index";
import { useColumns } from "./columns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Plus, Cpu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DevicesLayout from "@/layouts/devices/layout";
import AppLayout from '@/layouts/app-layout';
import { Link } from "@inertiajs/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePermission } from "@/utils/permissions";



interface Device {
  id: string;
  imei: string;
  serial_number: string;
  sim_number: string;
  firmware_version?: string;
  type: {
    id: number;
    name: string;
    manufacturer: string;
  };
  vehicle?: {
    id: string;
    registration: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  deleted_at: string | null;
}

interface DevicesPageProps {
  devices: {
    data: Device[];
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
    device_type_id?: string;
    vehicle_id?: string;
  };
  deviceTypes: { id: number; name: string; manufacturer: string }[];
  tenants: { id: string; name: string }[];
  vehicles?: { id: string; registration: string }[];
}

export default function Index({ devices, filters, deviceTypes, tenants, vehicles = [] }: DevicesPageProps) {
  const { __ } = useTranslation();
  const columns = useColumns();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const canCreateDevices = usePermission('create_devices');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      route('devices.index'),
      { search: searchTerm, ...filterValues },
      { preserveState: true }
    );
  }

  const [filterValues, setFilterValues] = useState({
    tenant_id: filters.tenant_id || 'all',
    device_type_id: filters.device_type_id || 'all',
    vehicle_id: filters.vehicle_id || 'all',
  });

  function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    router.get(
      route('devices.index'),
      { ...newFilters, search: searchTerm },
      { preserveState: true }
    );
  }

  function resetFilters() {
    setSearchTerm('');
    setFilterValues({
      tenant_id: 'all',
      device_type_id: 'all',
      vehicle_id: 'all',
    });
    router.get(route('devices.index'), {}, { preserveState: true });
  }

  // Count active filters for the badge
  const activeFiltersCount = [
    filterValues.tenant_id !== 'all', 
    filterValues.device_type_id !== 'all',
    filterValues.vehicle_id !== 'all',
  ].filter(Boolean).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("devices.title")} />

      <DevicesLayout>
        <div className="space-y-6">
          {devices?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Cpu className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{__('devices.list.no_devices')}</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {__('devices.list.get_started')}
              </p>
              <Button asChild size="default" className="h-9">
                <Link href={route('devices.create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {__('devices.actions.create')}
                </Link>
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={devices?.data || []}
              tableId="devices-table"
              config={{
                pagination: true,
                sorting: true,
                filtering: true,
                pageSize: devices?.meta?.per_page || 10
              }}
              noResultsMessage={__('devices.list.no_devices')}
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
                  {canCreateDevices && (
                    <Button asChild size="default" className="h-9">
                      <Link href={route("devices.create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        {__("devices.actions.create")}
                      </Link>
                    </Button>
                  )}
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="default" className="h-9">
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
                            {__("devices.filters.tenant")}
                          </label>
                          <Select
                            value={filterValues.tenant_id}
                            onValueChange={(value) => handleFilterChange("tenant_id", value)}
                          >
                            <SelectTrigger id="tenant-filter" className="w-full">
                              <SelectValue placeholder={__("devices.placeholders.tenant")} />
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
                          <label className="text-sm font-medium" htmlFor="device-type-filter">
                            {__("devices.filters.device_type")}
                          </label>
                          <Select
                            value={filterValues.device_type_id}
                            onValueChange={(value) => handleFilterChange("device_type_id", value)}
                          >
                            <SelectTrigger id="device-type-filter" className="w-full">
                              <SelectValue placeholder={__("devices.placeholders.device_type")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{__("common.all_device_types")}</SelectItem>
                              {deviceTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.manufacturer} - {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="vehicle-filter">
                            {__("devices.filters.vehicle")}
                          </label>
                          <Select
                            value={filterValues.vehicle_id}
                            onValueChange={(value) => handleFilterChange("vehicle_id", value)}
                          >
                            <SelectTrigger id="vehicle-filter" className="w-full">
                              <SelectValue placeholder={__("devices.placeholders.vehicle")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{__("common.all_vehicles")}</SelectItem>
                              <SelectItem value="none">{__("common.no_vehicle")}</SelectItem>
                              {vehicles?.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.registration}
                                </SelectItem>
                              ))}
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
      </DevicesLayout>
    </AppLayout>
  );
} 