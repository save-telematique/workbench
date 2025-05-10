import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions";
import { useStandardActions } from "@/utils/actions";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DriverResource } from "@/types";

export function useColumns() {
  const { __ } = useTranslation();
  const getStandardActions = useStandardActions({
    resourceName: "drivers"
  });
  
  const columns: ColumnDef<DriverResource>[] = [
    {
      accessorKey: "surname",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.surname")}
        />
      ),
      cell: ({ row }) => {
        const driver = row.original;
        const name = `${driver.surname} ${driver.firstname}`;
        
        return (
          <div>
            <Link
              href={route("drivers.show", { driver: driver.id })}
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
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.phone")}
        />
      ),
      cell: ({ row }) => row.original.phone || "-"
    },
    {
      accessorKey: "license_number",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.license_number")}
        />
      ),
      cell: ({ row }) => row.original.license_number || "-"
    },
    {
      accessorFn: (row) => row.tenant?.name ?? "",
      id: "tenant",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.tenant")}
        />
      ),
      cell: ({ row }) => (
        row.original.tenant ? row.original.tenant.name : "-"
      ),
    },
    {
      accessorFn: (row) => row.user?.name ?? "",
      id: "user",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.user")}
        />
      ),
      cell: ({ row }) => (
        row.original.user ? row.original.user.name : "-"
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = { ...row.original, resourceName: "drivers" };
        
        return (
          <DataTableRowActions
            row={row}
            actions={getStandardActions(driver)}
            menuLabel={__("common.actions_header")}
          />
        );
      },
    },
  ];
  
  return columns;
} 