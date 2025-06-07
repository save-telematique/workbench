import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions";
import { useStandardActions } from "@/utils/actions";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DriverResource } from "@/types";
import { useTenantUser } from "@/utils/permissions";

export function useColumns() {
  const { __ } = useTranslation();
  const isTenantUser = useTenantUser();
  
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
      accessorFn: (row) => row.group?.full_path ?? "",
      id: "group",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.group")}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.group ? (
            <Link
              href={route("groups.show", { group: row.original.group.id })}
              className="hover:underline"
            >
              {row.original.group.full_path}
            </Link>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      accessorKey: "card_number",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("drivers.fields.card_number")}
        />
      ),
      cell: ({ row }) => row.original.card_number || "-"
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
    ...(!isTenantUser ? [{
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
    }] : []),
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