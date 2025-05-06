import { Head, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { DataTable } from "@/components/ui/data-table";
import { useColumns } from "./columns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Plus, UserCog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from '@/layouts/app-layout';
import { Link } from "@inertiajs/react";
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

interface Driver {
  id: string;
  surname: string;
  firstname: string;
  phone: string;
  license_number: string;
  tenant?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
  deleted_at: string | null;
}

interface DriversPageProps {
  drivers: {
    data: Driver[];
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
  };
  tenants: { id: string; name: string }[];
}

export default function Index({ drivers, filters, tenants }: DriversPageProps) {
  const { __ } = useTranslation();
  const columns = useColumns();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const canCreateDrivers = usePermission('create_drivers');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('drivers.breadcrumbs.index'),
      href: route('drivers.index'),
    },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      route('drivers.index'),
      { search: searchTerm, ...filterValues },
      { preserveState: true }
    );
  }

  const [filterValues, setFilterValues] = useState({
    tenant_id: filters.tenant_id || 'all',
  });

  function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    router.get(
      route('drivers.index'),
      { ...newFilters, search: searchTerm },
      { preserveState: true }
    );
  }

  function resetFilters() {
    setSearchTerm('');
    setFilterValues({
      tenant_id: 'all',
    });
    router.get(route('drivers.index'), {}, { preserveState: true });
  }

  // Count active filters for the badge
  const activeFiltersCount = [
    filterValues.tenant_id !== 'all', 
  ].filter(Boolean).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("drivers.title")} />

      <DriversLayout showSidebar={false}>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
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

            <div className="flex gap-2 self-end">
              {canCreateDrivers && (
                <Button asChild>
                  <Link href={route("drivers.create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    {__("drivers.actions.create")}
                  </Link>
                </Button>
              )}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
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
                        {__("drivers.filters.tenant")}
                      </label>
                      <Select
                        value={filterValues.tenant_id}
                        onValueChange={(value) => handleFilterChange("tenant_id", value)}
                      >
                        <SelectTrigger id="tenant-filter" className="w-full">
                          <SelectValue placeholder={__("drivers.placeholders.tenant")} />
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

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="text-sm h-9 px-3"
                      >
                        <X className="mr-2 h-4 w-4" />
                        {__("common.reset")}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {!drivers?.data || drivers.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <UserCog className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{__('drivers.list.no_drivers')}</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {__('drivers.list.get_started')}
              </p>
              {canCreateDrivers && (
                <Button asChild>
                  <Link href={route('drivers.create')}>
                    {__('drivers.actions.create')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={drivers.data}
              pagination={drivers?.meta ? {
                pageCount: drivers.meta.last_page,
                pageIndex: drivers.meta.current_page - 1,
                pageSize: drivers.meta.per_page,
                canPreviousPage: drivers.meta.current_page > 1,
                canNextPage: drivers.meta.current_page < drivers.meta.last_page,
              } : undefined}
              filters={{ ...filterValues, search: searchTerm }}
            />
          )}
        </div>
      </DriversLayout>
    </AppLayout>
  );
} 