import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { Eye, PenBox, Trash, RotateCcw } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/utils/permissions";
import { DeleteDriverDialog } from "./dialogs/delete-dialog";
import { RestoreDriverDialog } from "./dialogs/restore-dialog";

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

export function useColumns() {
  const { __ } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<string | null>(null);
  
  const canEditDrivers = usePermission("edit_drivers");
  const canDeleteDrivers = usePermission("delete_drivers");
  
  const columns: ColumnDef<Driver>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={__("common.select_all")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={__("common.select_row")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "surname",
      header: __("drivers.fields.surname"),
      cell: ({ row }) => {
        const driver = row.original;
        const name = `${driver.surname} ${driver.firstname}`;
        
        return (
          <div>
            <Link
              href={route("drivers.show", driver.id)}
              className="font-medium hover:underline"
            >
              {name}
            </Link>
            {driver.deleted_at && (
              <Badge variant="outline" className="ml-2">
                {__("common.deleted")}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "phone",
      header: __("drivers.fields.phone"),
      cell: ({ row }) => row.original.phone || "-"
    },
    {
      accessorKey: "license_number",
      header: __("drivers.fields.license_number"),
      cell: ({ row }) => row.original.license_number || "-"
    },
    {
      accessorKey: "tenant",
      header: __("drivers.fields.tenant"),
      cell: ({ row }) => (
        row.original.tenant ? row.original.tenant.name : "-"
      ),
    },
    {
      accessorKey: "user",
      header: __("drivers.fields.user"),
      cell: ({ row }) => (
        row.original.user ? row.original.user.name : "-"
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original;
        
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{__("common.open_menu")}</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{__("common.actions")}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={route("drivers.show", driver.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {__("common.view")}
                  </Link>
                </DropdownMenuItem>
                {!driver.deleted_at && canEditDrivers && (
                  <DropdownMenuItem asChild>
                    <Link href={route("drivers.edit", driver.id)}>
                      <PenBox className="mr-2 h-4 w-4" />
                      {__("common.edit")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {!driver.deleted_at && canDeleteDrivers && (
                  <DropdownMenuItem onClick={() => setOpenDeleteDialog(driver.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    {__("common.delete")}
                  </DropdownMenuItem>
                )}
                {driver.deleted_at && canEditDrivers && (
                  <DropdownMenuItem onClick={() => setOpenRestoreDialog(driver.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {__("common.restore")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Delete dialog */}
            <DeleteDriverDialog
              open={openDeleteDialog === driver.id}
              onOpenChange={() => setOpenDeleteDialog(null)}
              driver={driver}
            />
            
            {/* Restore dialog */}
            <RestoreDriverDialog
              open={openRestoreDialog === driver.id}
              onOpenChange={() => setOpenRestoreDialog(null)}
              driver={driver}
            />
          </>
        );
      },
    },
  ];
  
  return columns;
} 