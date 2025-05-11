import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader, DataTableRowActions } from "@/components/ui/data-table";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { LicensePlate } from "@/components/ui/license-plate";
import { useStandardActions } from "@/utils/actions";
import { DeviceResource } from "@/types";
import { formatDate } from "@/utils";

export const useColumns = () => {
  const { __ } = useTranslation();
  const getStandardActions = useStandardActions({
    resourceName: "devices"
  });

  const columns: ColumnDef<DeviceResource>[] = [
    {
      accessorKey: "serial_number",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.serial_number")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Link
              href={route("devices.show", { device: row.original.id })}
            >
              {row.getValue("serial_number")}
            </Link>
          </span>
        </div>
      ),
    },
    {
      accessorKey: "imei",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.imei")}
        />
      ),
      cell: ({ row }) => (
        <div>{row.getValue("imei")}</div>
      ),
    },
    {
      accessorKey: "last_contact_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.last_contact_at")}
        />
      ),
      cell: ({ row }) => (
        <div>{formatDate(row.original.last_contact_at, "RELATIVE")}</div>
      ),
    },
    {
      accessorFn: (row) => row.type ? `${row.type.manufacturer} - ${row.type.name}` : "",
      id: "device_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.device_type")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[180px]">
          {row.original.type ? (
            <span>
              {row.original.type.manufacturer} - {row.original.type.name}
            </span>
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.vehicle?.registration ?? "",
      id: "vehicle",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.vehicle")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.vehicle ? (
            <LicensePlate 
              registration={row.original.vehicle.registration}
              size="md"
              href={route("vehicles.show", { vehicle: row.original.vehicle.id })}
            />
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.tenant?.name ?? "",
      id: "tenant",
      enableHiding: true,
      enableSorting: true,
      header: __("devices.fields.tenant"),
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
      id: "actions",
      cell: ({ row }) => {
        const device = { ...row.original, resourceName: "devices" };
        
        return (
          <DataTableRowActions
            row={row}
            actions={getStandardActions(device)}
            menuLabel={__("common.actions_header")}
          />
        );
      },
    },
  ];

  return columns;
}; 