// Export des composants DataTable pour une utilisation facile

export { DataTable } from "./data-table"
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableColumnVisibility } from "./data-table-column-visibility"
export { DataTableRowActions } from "./data-table-row-actions"

// Types réexportés de react-table pour une utilisation facile
export type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  ColumnOrderState,
  ColumnPinningState,
} from "@tanstack/react-table"

// Export action type from row actions
export type { Action } from "./data-table-row-actions"

/**
 * # DataTable Component
 * 
 * Enhanced DataTable with column management, sorting, filtering, and action bar slots.
 * 
 * ## Usage
 * 
 * ```tsx
 * import { DataTable } from "@/components/ui/data-table";
 * 
 * export default function MyTable() {
 *   return (
 *     <DataTable
 *       columns={columns}
 *       data={data}
 *       tableId="my-unique-table-id"
 *       config={{
 *         pagination: true,
 *         sorting: true,
 *       }}
 *       actionBarLeft={<SearchInput />}
 *       actionBarRight={<AddButton />}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Props
 * 
 * - `columns`: Array of column definitions
 * - `data`: Array of data objects
 * - `tableId`: Unique ID for the table (used for persistence)
 * - `config`: Configuration object for table features
 * - `noResultsMessage`: Custom message when table is empty
 * - `actionBarLeft`: ReactNode for the left side of the action bar (search, filters, etc.)
 * - `actionBarRight`: ReactNode for the right side of the action bar (add, delete, etc.)
 * 
 * ## Features
 * 
 * - Column visibility management
 * - Column reordering via drag and drop
 * - Column pinning (left/right)
 * - Pagination
 * - Sorting
 * - User preference persistence
 * - Action bar slots for custom controls
 * - Automatic translation of string headers
 * 
 * ## Action Bar Slots
 * 
 * The DataTable now provides two slots for placing UI controls:
 * 
 * ### Left Slot (`actionBarLeft`)
 * 
 * Typically used for search inputs, filter dropdowns, or selection controls:
 * 
 * ```tsx
 * <DataTable
 *   // ... other props
 *   actionBarLeft={
 *     <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
 *       <div className="relative w-full">
 *         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 *         <Input
 *           placeholder="Search..."
 *           value={searchTerm}
 *           onChange={(e) => setSearchTerm(e.target.value)}
 *           className="pl-8 w-full"
 *         />
 *       </div>
 *       <Button type="submit" size="icon" variant="outline">
 *         <Search className="h-4 w-4" />
 *       </Button>
 *     </form>
 *   }
 * />
 * ```
 * 
 * ### Right Slot (`actionBarRight`)
 * 
 * Typically used for action buttons like add, export, or filter toggles:
 * 
 * ```tsx
 * <DataTable
 *   // ... other props
 *   actionBarRight={
 *     <div className="flex gap-2">
 *       <Button asChild>
 *         <Link href={route("items.create")}>
 *           <Plus className="mr-2 h-4 w-4" />
 *           Add New
 *         </Link>
 *       </Button>
 *       <Button variant="outline">
 *         <Filter className="mr-2 h-4 w-4" />
 *         Filters
 *       </Button>
 *     </div>
 *   }
 * />
 * ```
 * 
 * ### Notes on Action Bar
 * 
 * - The "Columns" button will automatically be appended to the end of the right slot
 * - Both slots are responsive and will stack on mobile
 * - If no content is provided for either slot, that part of the action bar will not be rendered
 * - For consistent sizing in forms, use `h-9` for button heights
 * 
 * ## Column Headers and Translation
 * 
 * The DataTable now automatically wraps simple string headers with DataTableColumnHeader components:
 * 
 * ```tsx
 * const columns = [
 *   // Both of these approaches now work the same way:
 *   
 *   // 1. Simple string header (automatically wrapped with DataTableColumnHeader and translated)
 *   {
 *     accessorKey: "name",
 *     header: "common.name",
 *   },
 *   
 *   // 2. Manual DataTableColumnHeader (provides more control)
 *   {
 *     accessorKey: "email",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title={__("common.email")} />
 *     ),
 *   }
 * ];
 * ```
 * 
 * ### Benefits
 * 
 * - String headers are automatically processed for translation
 * - Headers automatically get sorting controls when enabled
 * - Headers include pinning controls in the dropdown menu
 * - Column headers maintain consistent styling across the table
 * 
 * ### Translation Keys
 * 
 * When using string headers, they are automatically passed through the translation function.
 * Make sure to define these keys in your language files:
 * 
 * ```php
 * // lang/en/common.php
 * return [
 *   'name' => 'Name',
 *   'email' => 'Email Address',
 *   // ... other translations
 * ];
 * ```
 * 
 */ 