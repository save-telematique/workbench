import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { useStandardActions } from "@/utils/actions";
import { useTenantUser } from "@/utils/permissions";
import { GeofenceResource } from "@/types";

export const useColumns = () => {
  const { __ } = useTranslation();
  const isTenantUser = useTenantUser();
  const getStandardActions = useStandardActions({
    resourceName: "geofences"
  });

  const columns: ColumnDef<GeofenceResource>[] = [
    {
      accessorKey: "name",
      header: "geofences.fields.name",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-medium">
            <Link
              href={route("geofences.show", { geofence: row.original.id })}
              className="hover:underline"
            >
              {row.getValue("name")}
            </Link>
          </span>
          {row.original.deleted_at && (
            <Badge variant="outline" className="text-destructive border-destructive">
              {__("common.deleted")}
            </Badge>
          )}
        </div>
      ),
    },
    // Only show tenant column for central users
    ...(!isTenantUser ? [{
      accessorFn: (row: GeofenceResource) => row.tenant?.name ?? "",
      id: "tenant",
      header: "geofences.fields.tenant",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }: { row: { original: GeofenceResource } }) => (
        <div className="w-[180px]">
          {row.original.tenant ? (
            <Link
              href={route("tenants.show", { tenant: row.original.tenant.id })}
              className="hover:underline"
            >
              {row.original.tenant.name}
            </Link>
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    } as ColumnDef<GeofenceResource>] : []),
    {
      accessorFn: (row) => row.group?.name ?? "",
      id: "group",
      header: "geofences.fields.group",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[150px]">
          {row.original.group ? (
            <Link
              href={route("groups.show", { group: row.original.group.id })}
              className="hover:underline"
            >
              {row.original.group.name}
            </Link>
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "geofences.fields.status",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {__(row.original.is_active ? "geofences.status.active" : "geofences.status.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "common.created_at",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <div className="w-[150px]">
            {date ? new Date(date).toLocaleDateString() : '-'}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const geofence = { ...row.original, resourceName: "geofences" };
        
        return (
          <DataTableRowActions
            row={row}
            actions={getStandardActions(geofence)}
            menuLabel={__("common.actions_header")}
          />
        );
      },
    },
  ];

  return columns;
}; 