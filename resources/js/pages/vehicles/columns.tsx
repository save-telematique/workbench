import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { LicensePlate } from "@/components/ui/license-plate";
import { useStandardActions } from "@/utils/actions";
import { VehicleResource } from "@/types";

export const useColumns = () => {
  const { __ } = useTranslation();
  const getStandardActions = useStandardActions({
    resourceName: "vehicles"
  });

  const columns: ColumnDef<VehicleResource>[] = [
    {
      accessorKey: "registration",
      header: "vehicles.fields.registration",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Link
              href={route("vehicles.show", { vehicle: row.original.id })}
            >
              <LicensePlate 
                registration={row.getValue("registration")}
                size="md"
              />
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
    {
      accessorFn: (row) => row.tenant?.name ?? "",
      id: "tenant",
      header: "vehicles.fields.tenant",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[180px]">
          {row.original.tenant ? (
            <Link
              href={route("tenants.show", { tenant: row.original.tenant.id })}
            >
              {row.original.tenant.name}
            </Link>
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: "vehicles.fields.brand",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[100px]">{row.original.vehicle_model?.vehicle_brand?.name}</div>
      ),
    },
    {
      accessorKey: "model",
      header: "vehicles.fields.model",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[120px]">{row.original.vehicle_model?.name}</div>
      ),
    },
    {
      accessorFn: (row) => row.type?.name ?? "",
      id: "type",
      header: "vehicles.fields.type",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[100px]">
          {row.original.type ? row.original.type.name : 
          <span className="text-gray-400">{__("common.none")}</span>}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.group?.full_path ?? "",
      id: "group",
      header: "vehicles.fields.group",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[150px]">
          {row.original.group ? (
            <Link
              href={route("groups.show", { group: row.original.group.id })}
              className="hover:underline"
            >
              {row.original.group.full_path}
            </Link>
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "vin",
      header: "vehicles.fields.vin",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[130px]">{row.getValue("vin")}</div>
      ),
    },
    {
      accessorFn: (row) => row.device?.serial_number ?? "",
      id: "device",
      header: "vehicles.fields.device",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => (
        <div className="w-[180px]">
          {row.original.device ? (
            <Link
              href={route("devices.show", { device: row.original.device.id })}
            >
              {row.original.device.serial_number}
            </Link>
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const vehicle = { ...row.original, resourceName: "vehicles" };
        
        return (
          <DataTableRowActions
            row={row}
            actions={getStandardActions(vehicle)}
            menuLabel={__("common.actions_header")}
          />
        );
      },
    },
  ];

  return columns;
}; 