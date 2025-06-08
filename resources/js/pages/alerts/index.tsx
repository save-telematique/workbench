import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { type BreadcrumbItem, type ResourceCollection, AlertResource } from "@/types";
import { useTranslation } from "@/utils/translation";

import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useColumns } from "@/pages/alerts/columns";
import AppLayout from "@/layouts/app-layout";
import AlertsLayout from "@/layouts/alerts/layout";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AlertIndexProps {
  alerts: ResourceCollection<AlertResource>;
  filters: {
    search?: string;
    status?: 'all' | 'read' | 'unread';
    severity?: 'all' | 'info' | 'warning' | 'error' | 'success';
    type?: string;
  };
}

export default function Index({ alerts, filters }: AlertIndexProps) {
  const { __ } = useTranslation();
  const columns = useColumns();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const [filterValues, setFilterValues] = useState({
    status: filters.status || 'all',
    severity: filters.severity || 'all',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('alerts.breadcrumbs.index'),
      href: route('alerts.index'),
    },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.get(route('alerts.index'), { search: searchTerm, ...filterValues }, { preserveState: true });
  }

  function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    router.get(route('alerts.index'), { ...newFilters, search: searchTerm }, { preserveState: true });
  }

  function resetFilters() {
    setSearchTerm('');
    setFilterValues({
      status: 'all',
      severity: 'all',
    });
    router.get(route('alerts.index'), {}, { preserveState: true });
  }

  // Count active filters for the badge
  const activeFiltersCount = [filterValues.status !== 'all', filterValues.severity !== 'all'].filter(Boolean).length;

  const getUnreadCount = () => {
    return alerts.data.filter(alert => !alert.is_read).length;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("alerts.title")} />

      <AlertsLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {__('alerts.title')}
              </h2>
              <p className="text-muted-foreground">
                {__('alerts.description')}
              </p>
              {getUnreadCount() > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {__('alerts.unread_count', { count: getUnreadCount() })}
                </Badge>
              )}
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={alerts.data}
            tableId="alerts-table"
            config={{
              pagination: true,
              sorting: true,
              pageSize: alerts?.meta?.per_page || 10,
            }}
            noResultsMessage={__('alerts.no_results')}
            actionBarLeft={
              <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
                <div className="relative w-full">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    placeholder={__('alerts.search_placeholder')}
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
                        <label className="text-sm font-medium" htmlFor="status-filter">
                          {__('alerts.fields.status')}
                        </label>
                        <Select value={filterValues.status} onValueChange={(value) => handleFilterChange('status', value)}>
                          <SelectTrigger id="status-filter" className="w-full">
                            <SelectValue placeholder={__('alerts.filters.all')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{__('alerts.filters.all')}</SelectItem>
                            <SelectItem value="unread">{__('alerts.status.unread')}</SelectItem>
                            <SelectItem value="read">{__('alerts.status.read')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="severity-filter">
                          {__('alerts.fields.severity')}
                        </label>
                        <Select value={filterValues.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                          <SelectTrigger id="severity-filter" className="w-full">
                            <SelectValue placeholder={__('alerts.filters.all_severities')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{__('alerts.filters.all_severities')}</SelectItem>
                            <SelectItem value="info">{__('alerts.severity.info')}</SelectItem>
                            <SelectItem value="warning">{__('alerts.severity.warning')}</SelectItem>
                            <SelectItem value="error">{__('alerts.severity.error')}</SelectItem>
                            <SelectItem value="success">{__('alerts.severity.success')}</SelectItem>
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
      </AlertsLayout>
    </AppLayout>
  );
} 