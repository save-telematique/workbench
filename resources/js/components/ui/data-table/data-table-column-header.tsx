"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, PinIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/utils/translation"
import { Badge } from "@/components/ui/badge"

// Define interface for column meta
interface ColumnMeta {
  title?: string;
  [key: string]: unknown;
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  enablePinning?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enablePinning = true,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { __ } = useTranslation()
  
  const isPinned = column.getIsPinned()
  const canSort = column.getCanSort()
  
  // Check if there's a title in the column meta that should take precedence
  let finalTitle = title;
  if (column.columnDef.meta) {
    const meta = column.columnDef.meta as ColumnMeta;
    if (meta.title) {
      finalTitle = meta.title;
    }
  }
  
  // Translate the title if it's a translation key
  const translatedTitle = __(finalTitle)
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {isPinned && (
        <Badge variant="outline" className="h-5 px-1.5 mr-2">
          {isPinned === 'left' ? __('common.table.left') : __('common.table.right')}
        </Badge>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("-ml-3 h-8 data-[state=open]:bg-accent", 
              !canSort && "pointer-events-none"
            )}
          >
            <span>{translatedTitle}</span>
            {canSort && (
              column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              )
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {canSort && (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                {__('common.table.sort.asc')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                {__('common.table.sort.desc')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {enablePinning && (
            <>
              {!isPinned ? (
                <>
                  <DropdownMenuItem onClick={() => column.pin('left')}>
                    <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    {__('common.table.pin_left')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => column.pin('right')}>
                    <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 rotate-90" />
                    {__('common.table.pin_right')}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => column.pin(false)}>
                  <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 line-through" />
                  {__('common.table.unpin')}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 