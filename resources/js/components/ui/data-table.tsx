// Réexporter les composants Data Table à partir du dossier data-table
export * from './data-table/index'; 

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/utils/translation";
import { DataTable as NewDataTable } from "@/components/ui/data-table/index";
import { ReactNode } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
  } | boolean;
  sorting?: boolean;
  filtering?: boolean;
  columnManagement?: boolean;
  pageSize?: number;
  filters?: Record<string, string>;
  noResultsMessage?: string;
  actionBarLeft?: ReactNode;
  actionBarRight?: ReactNode;
  saveToPersistence?: boolean;
  tableId?: string;
}

// Backwards compatibility wrapper for the new DataTable component
export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = true,
  sorting = true,
  filtering = false,
  columnManagement = true,
  pageSize = 10,
  noResultsMessage,
  actionBarLeft,
  actionBarRight,
  saveToPersistence = false,
  tableId,
}: DataTableProps<TData, TValue>) {
  const { __ } = useTranslation();
  
  // Generate a unique tableId if not provided
  const finalTableId = tableId || `table-${Date.now()}`;
  
  // Configure the new DataTable props based on the old API
  return (
    <NewDataTable 
      columns={columns}
      data={data}
      tableId={finalTableId}
      config={{
        pagination: !!pagination,
        sorting,
        filtering,
        columnManagement,
        pageSize: typeof pagination === 'object' ? pagination.pageSize : pageSize,
        saveToPersistence
      }}
      noResultsMessage={noResultsMessage || __("common.no_results")}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
    />
  );
} 