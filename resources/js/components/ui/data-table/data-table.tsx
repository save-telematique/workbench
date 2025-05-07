"use client"

import { 
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  VisibilityState,
  ColumnOrderState,
  ColumnPinningState,
  Column,
} from "@tanstack/react-table"
import { useEffect, useState, ReactNode, useMemo } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableColumnVisibility } from "./data-table-column-visibility"
import { DataTableColumnHeader } from "./data-table-column-header"
import { useTranslation } from "@/utils/translation"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ArrowDown, ArrowUp, EyeOff, PinIcon } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  tableId: string
  config?: {
    pagination?: boolean
    sorting?: boolean
    filtering?: boolean
    columnManagement?: boolean
    pageSize?: number
    saveToPersistence?: boolean
  }
  noResultsMessage?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
}

// Define interface for column meta
interface ColumnMeta {
  title?: string;
  [key: string]: unknown;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableId,
  config = {},
  noResultsMessage,
  actionBarLeft,
  actionBarRight,
}: DataTableProps<TData, TValue>) {
  const { __ } = useTranslation()
  
  // Default configuration
  const {
    pagination = true,
    sorting = true,
    filtering = false,
    columnManagement = true,
    pageSize = 10,
    saveToPersistence = true,
  } = config
  
  // Process columns to ensure all headers use DataTableColumnHeader
  const processedColumns = useMemo(() => {
    return columns.map(column => {
      // Skip if column already has a header defined as a function
      if (typeof column.header === 'function') {
        return column;
      }
      
      // If header is a string or is missing, create a DataTableColumnHeader
      let headerTitle = '';
      
      if (typeof column.header === 'string') {
        headerTitle = column.header;
      } else if ('accessorKey' in column && typeof column.accessorKey === 'string') {
        headerTitle = column.accessorKey;
      } else if (column.id) {
        // Only use column.id as fallback if it's likely to be a display name
        // Skip action columns or columns with technical IDs
        if (!column.id.includes('actions') && 
            !column.id.includes('select') && 
            !column.id.includes('expand')) {
          headerTitle = column.id;
        }
      }
      
      // If no valid title was found, don't wrap with a header component
      if (!headerTitle) {
        return column;
      }
      
      // Preserve any existing meta data and add title if not already present
      const meta = 'meta' in column ? {...column.meta as ColumnMeta} : {} as ColumnMeta;
      meta.title = headerTitle;
      
      return {
        ...column,
        meta,
        header: ({ column }: { column: Column<TData, unknown> }) => (
          <DataTableColumnHeader 
            column={column} 
            title={headerTitle}
          />
        ),
      } as ColumnDef<TData, TValue>;
    });
  }, [columns]);
  
  const [sorting_, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([])
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  })
  const [pagination_, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  // Load saved column preferences from localStorage
  useEffect(() => {
    if (!saveToPersistence) return
    
    try {
      // Load column visibility
      const savedVisibility = localStorage.getItem(`table-columns-${tableId}-visibility`)
      if (savedVisibility) {
        setColumnVisibility(JSON.parse(savedVisibility))
      }
      
      // Load column order
      const savedOrder = localStorage.getItem(`table-columns-${tableId}-order`)
      if (savedOrder) {
        setColumnOrder(JSON.parse(savedOrder))
      }
      
      // Load column pinning
      const savedPinning = localStorage.getItem(`table-columns-${tableId}-pinning`)
      if (savedPinning) {
        setColumnPinning(JSON.parse(savedPinning))
      }
    } catch (e) {
      console.error("Error loading table preferences from localStorage", e)
    }
  }, [tableId, saveToPersistence])

  // Save column preferences to localStorage when they change
  useEffect(() => {
    if (!saveToPersistence) return
    
    if (Object.keys(columnVisibility).length > 0) {
      localStorage.setItem(`table-columns-${tableId}-visibility`, JSON.stringify(columnVisibility))
    }
    
    if (columnOrder.length > 0) {
      localStorage.setItem(`table-columns-${tableId}-order`, JSON.stringify(columnOrder))
    }
    
    const leftPins = columnPinning.left ?? []
    const rightPins = columnPinning.right ?? []
    
    if (leftPins.length > 0 || rightPins.length > 0) {
      localStorage.setItem(`table-columns-${tableId}-pinning`, JSON.stringify(columnPinning))
    }
  }, [columnVisibility, columnOrder, columnPinning, tableId, saveToPersistence])

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: sorting ? getSortedRowModel() : undefined,
    onSortingChange: sorting ? setSorting : undefined,
    onColumnFiltersChange: filtering ? setColumnFilters : undefined,
    onPaginationChange: pagination ? setPagination : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    state: {
      sorting: sorting ? sorting_ : undefined,
      columnFilters: filtering ? columnFilters : undefined,
      pagination: pagination ? pagination_ : undefined,
      columnVisibility,
      columnOrder,
      columnPinning,
    },
  })

  return (
    <div className="space-y-4">
      {/* Action bar */}
      {(actionBarLeft || actionBarRight || columnManagement) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left slot - for search inputs, filters, etc. */}
          <div className="w-full sm:w-auto">
            {actionBarLeft}
          </div>
          
          {/* Right slot - for action buttons and column visibility */}
          <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-2 ml-auto">
            {/* User-provided right slot content */}
            {actionBarRight}
            
            {/* Column management button always appears at the end */}
            {columnManagement && (
              <DataTableColumnVisibility 
                table={table} 
                tableId={tableId} 
                saveToPersistence={saveToPersistence} 
              />
            )}
          </div>
        </div>
      )}
      
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <ContextMenu key={header.id}>
                      <ContextMenuTrigger asChild>
                        <TableHead className={
                          header.column.getIsPinned() 
                            ? `sticky ${header.column.getIsPinned() === 'left' ? 'left-0' : 'right-0'} z-10 bg-background`
                            : ''
                        }>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        {header.column.getCanSort() && (
                          <>
                            <ContextMenuItem onClick={() => header.column.toggleSorting(false)}>
                              <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                              {__('common.table.sort.asc')}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => header.column.toggleSorting(true)}>
                              <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                              {__('common.table.sort.desc')}
                            </ContextMenuItem>
                          </>
                        )}
                        {header.column.getCanHide() && (
                          <ContextMenuItem onClick={() => header.column.toggleVisibility(false)}>
                            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            {__('common.table.hide_column')}
                          </ContextMenuItem>
                        )}
                        {!header.column.getIsPinned() && (
                          <>
                            <ContextMenuItem onClick={() => header.column.pin('left')}>
                              <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                              {__('common.table.pin_left')}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => header.column.pin('right')}>
                              <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 rotate-90" />
                              {__('common.table.pin_right')}
                            </ContextMenuItem>
                          </>
                        )}
                        {header.column.getIsPinned() && (
                          <ContextMenuItem onClick={() => header.column.pin(false)}>
                            <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 line-through" />
                            {__('common.table.unpin')}
                          </ContextMenuItem>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={
                        cell.column.getIsPinned() 
                          ? `sticky ${cell.column.getIsPinned() === 'left' ? 'left-0' : 'right-0'} z-10 bg-background`
                          : ''
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {noResultsMessage || __('common.no_results')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
} 