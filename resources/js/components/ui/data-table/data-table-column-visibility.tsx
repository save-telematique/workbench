/**
 * # DataTable Column Visibility Component
 * 
 * This component handles column visibility, ordering, and pinning for DataTable.
 * 
 * ## Best Practices for Column Definitions
 * 
 * When defining columns for DataTable, follow these guidelines for proper sorting:
 * 
 * 1. For simple properties, use `accessorKey`:
 *    ```
 *    {
 *      accessorKey: "name",
 *      header: "common.name"
 *    }
 *    ```
 * 
 * 2. For nested properties or when displaying different values than what you want to sort by,
 *    always use `accessorFn` with an explicit `id`:
 *    ```
 *    {
 *      accessorFn: (row) => row.tenant?.name ?? "",
 *      id: "tenant",
 *      header: "vehicles.fields.tenant"
 *    }
 *    ```
 * 
 * 3. For boolean or status displays (badges, icons), use accessorFn to return sortable values:
 *    ```
 *    {
 *      accessorFn: (row) => row.is_active ? 1 : 0,
 *      id: "status",
 *      header: "common.status"
 *    }
 *    ```
 * 
 * Refer to the documentation in resources/js/components/ui/data-table/index.tsx for more examples.
 */

"use client"

import { Column, Table } from "@tanstack/react-table"
import { Settings2, EyeOff, Eye, GripVertical, PinIcon, PinOffIcon } from "lucide-react"
import { useTranslation } from "@/utils/translation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd"

interface DataTableColumnVisibilityProps<TData> {
  table: Table<TData>
  tableId: string
  saveToPersistence?: boolean
}

// Define interface for column meta
interface ColumnMeta {
  title?: string;
  [key: string]: unknown;
}

export function DataTableColumnVisibility<TData>({
  table,
  tableId,
  saveToPersistence = true,
}: DataTableColumnVisibilityProps<TData>) {
  const { __ } = useTranslation()
  
  // Helper function to extract column display name
  const getColumnDisplayName = (column: Column<TData, unknown>): string | null => {
    // Try to extract a displayable title from the column definition
    try {

      // Case 1: For columns with function headers, try to extract metadata
      if (column.columnDef.header && typeof column.columnDef.header === 'function') {
        // If we have meta.title, use that directly
        if ('meta' in column.columnDef && column.columnDef.meta) {
          const meta = column.columnDef.meta as ColumnMeta;
          if (meta.title) {
            return __(meta.title);
          }
        }
        
        // Try to use accessorKey as a fallback for meaningful column names
        if ('accessorKey' in column.columnDef && typeof column.columnDef.accessorKey === 'string') {
          return __(column.columnDef.accessorKey);
        }
        
        // For action columns, try to use a meaningful ID as fallback
        if (column.id && 
            !column.id.includes('select_') && 
            !column.id.includes('expand_')) {
          // For action columns, display the ID without translation
          if (column.id.includes('actions')) {
            return column.id;
          }
          return __(column.id);
        }
        
        // No meaningful title found
        return null;
      }
      
      // Case 2: For string headers, use directly (translated)
      if (typeof column.columnDef.header === 'string') {
        return column.columnDef.header;
      } 
      
      // Case 3: Try accessorKey as fallback
      if ('accessorKey' in column.columnDef && typeof column.columnDef.accessorKey === 'string') {
        return __(column.columnDef.accessorKey);
      }
      
      // Case 4: For columns with just an ID, use as last resort
      if (column.id && 
          !column.id.includes('select_') && 
          !column.id.includes('expand_')) {
        return __(column.id);
      }
      
      // For columns without any title indicators, return null
      return null;
    } catch {
      // If anything fails, don't show columns without proper headers
      return null;
    }
  }
  
  // First get the column order from the table state
  const columnOrderFromTableState = table.getState().columnOrder;
  // Get all columns and sort them based on pinning status and columnOrderFromTableState
  const managableColumns = table.getAllColumns()
    .filter(column => column.getCanHide())
    .filter(column => getColumnDisplayName(column) !== null)
    .filter(column => column.id !== 'actions')
    .sort((a, b) => {
      // First, prioritize by pinning status
      const aPinned = a.getIsPinned();
      const bPinned = b.getIsPinned();
      
      // Put left-pinned columns first
      if (aPinned === 'left' && bPinned !== 'left') return -1;
      if (bPinned === 'left' && aPinned !== 'left') return 1;
      
      // Put right-pinned columns last
      if (aPinned === 'right' && bPinned !== 'right') return 1;
      if (bPinned === 'right' && aPinned !== 'right') return -1;
      
      // If both have the same pinning status (e.g., both unpinned or both pinned to the same side)
      // sort by column order if available
      if (columnOrderFromTableState.includes(a.id) && columnOrderFromTableState.includes(b.id)) {
        return columnOrderFromTableState.indexOf(a.id) - columnOrderFromTableState.indexOf(b.id);
      }
      
      // If only one column is in the order array, prioritize it
      if (columnOrderFromTableState.includes(a.id)) return -1;
      if (columnOrderFromTableState.includes(b.id)) return 1;
      
      // If neither column is in the order array, maintain original relative order (or fallback to id sort)
      return a.id.localeCompare(b.id); // Fallback sort to ensure stability if not in columnOrder
    });
  
  // Reorder columns
  const reorderColumns = (result: DropResult) => {
    if (!result.destination) return
    
    // Use the IDs from the currently rendered (and sortable) managableColumns list
    const currentColumnOrder = managableColumns.map(column => column.id)
    
    const newColumnOrder = [...currentColumnOrder]
    const [removed] = newColumnOrder.splice(result.source.index, 1)
    newColumnOrder.splice(result.destination.index, 0, removed)
    
    // Apply new column order
    table.setColumnOrder(newColumnOrder)
    
    // Save to localStorage
    if (saveToPersistence) {
      localStorage.setItem(`table-columns-${tableId}-order`, JSON.stringify(newColumnOrder))
    }
  }

  // Hide all columns
  const hideAllColumns = () => {
    table.getAllColumns().forEach(column => {
      if (column.getCanHide()) {
        column.toggleVisibility(false)
      }
    })
    
    // Save visibility state to localStorage
    if (saveToPersistence) {
      const visibilityState = table.getAllColumns().reduce(
        (acc, column) => ({ ...acc, [column.id]: false }),
        {} as Record<string, boolean>
      )
      localStorage.setItem(`table-columns-${tableId}-visibility`, JSON.stringify(visibilityState))
    }
  }

  // Show all columns
  const showAllColumns = () => {
    table.getAllColumns().forEach(column => {
      if (column.getCanHide()) {
        column.toggleVisibility(true)
      }
    })
    
    // Save visibility state to localStorage
    if (saveToPersistence) {
      const visibilityState = table.getAllColumns().reduce(
        (acc, column) => ({ ...acc, [column.id]: true }),
        {} as Record<string, boolean>
      )
      localStorage.setItem(`table-columns-${tableId}-visibility`, JSON.stringify(visibilityState))
    }
  }
  
  // Unpin all columns
  const unpinAllColumns = () => {
    table.getAllColumns().forEach(column => {
      if (column.getIsPinned()) {
        column.pin(false)
      }
    })
    
    // Save pinning state to localStorage
    if (saveToPersistence) {
      localStorage.setItem(`table-columns-${tableId}-pinning`, JSON.stringify({ left: [], right: [] }))
    }
  }
  
  // Reset all preferences to default
  const resetToDefault = () => {
    // Remove saved preferences
    if (saveToPersistence) {
      localStorage.removeItem(`table-columns-${tableId}-order`) 
      localStorage.removeItem(`table-columns-${tableId}-visibility`)
      localStorage.removeItem(`table-columns-${tableId}-pinning`)
    }
    
    // Reset to default state
    table.resetColumnOrder(true)
    showAllColumns()
    unpinAllColumns()
  }

  // Pin a column to the left or right
  const pinColumn = (columnId: string, side: 'left' | 'right' | false) => {
    const column = table.getColumn(columnId)
    if (column) {
      column.pin(side)
      
      // Save to localStorage
      if (saveToPersistence) {
        const pinningState = table.getState().columnPinning
        localStorage.setItem(`table-columns-${tableId}-pinning`, JSON.stringify(pinningState))
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2 className="h-4 w-4 mr-2" />
          {__("common.table.columns")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px]">
        <DropdownMenuLabel>{__("common.table.column_management")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="flex items-center px-2 py-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 flex-1"
            onClick={showAllColumns}
          >
            <Eye className="h-4 w-4 mr-2" />
            {__("common.table.show_all")}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 flex-1"
            onClick={hideAllColumns}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            {__("common.table.hide_all")}
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-[400px] overflow-y-auto px-1">
          <DragDropContext onDragEnd={reorderColumns}>
            <Droppable droppableId="column-visibility">
              {(provided: DroppableProvided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {managableColumns.map((column, index) => {
                      const displayTitle = getColumnDisplayName(column);
                      
                      // Skip columns without display title
                      if (!displayTitle) return null;
                      
                      return (
                        <Draggable 
                          key={column.id} 
                          draggableId={column.id} 
                          index={index} 
                          isDragDisabled={!!column.getIsPinned()}
                        >
                          {(provided: DraggableProvided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center py-1 px-2 rounded-md hover:bg-muted/50"
                            >
                              <div 
                                {...(column.getIsPinned() ? {} : provided.dragHandleProps)} 
                                className="mr-2"
                              >
                                {!column.getIsPinned() && (
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                )}
                                {column.getIsPinned() && (
                                  <div className="h-4 w-4" />
                                )}
                              </div>
                              <Checkbox
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => {
                                  column.toggleVisibility(!!value)
                                  
                                  // Save to localStorage
                                  if (saveToPersistence) {
                                    const visibilityState = JSON.parse(
                                      localStorage.getItem(`table-columns-${tableId}-visibility`) || "{}"
                                    )
                                    localStorage.setItem(
                                      `table-columns-${tableId}-visibility`,
                                      JSON.stringify({
                                        ...visibilityState,
                                        [column.id]: !!value,
                                      })
                                    )
                                  }
                                }}
                                id={`column-${column.id}`}
                                className="mr-2"
                              />
                              <label
                                htmlFor={`column-${column.id}`}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                {displayTitle}
                              </label>
                              
                              <div className="flex space-x-1">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5">
                                      { column.getIsPinned() ? (
                                        <PinOffIcon className="h-3 w-3" />
                                      ) : (
                                        <PinIcon className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[120px]">
                                    {!column.getIsPinned() && (
                                      <>
                                        <DropdownMenuLabel className="text-xs">{__('common.table.pin_column')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 px-2 w-full justify-start" 
                                          onClick={() => pinColumn(column.id, 'left')}
                                        >
                                          <PinIcon className="h-3.5 w-3.5 mr-2" />
                                          {__('common.table.left')}
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 px-2 w-full justify-start" 
                                          onClick={() => pinColumn(column.id, 'right')}
                                        >
                                          <PinIcon className="h-3.5 w-3.5 mr-2 rotate-90" />
                                          {__('common.table.right')}
                                        </Button>
                                      </>
                                    )}
                                    {column.getIsPinned() && (
                                      <>
                                        <DropdownMenuLabel className="text-xs">{__('common.table.unpin_column')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 px-2 w-full justify-start" 
                                          onClick={() => pinColumn(column.id, false)}
                                        >
                                          <PinIcon className="h-3.5 w-3.5 mr-2 line-through" />
                                          {__('common.table.unpin')}
                                        </Button>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 w-full text-muted-foreground"
            onClick={resetToDefault}
          >
            {__("common.table.reset_default")}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 