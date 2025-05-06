import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { useTranslation } from "@/utils/translation";
import { Link, router } from "@inertiajs/react";
import { LicensePlate } from "@/components/ui/license-plate";
import { useStandardActions } from "@/utils/actions";

interface Device {
  id: string;
  imei: string;
  serial_number: string;
  sim_number: string;
  firmware_version?: string;
  type: {
    id: number;
    name: string;
    manufacturer: string;
  };
  vehicle?: {
    id: string;
    registration: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  deleted_at: string | null;
}

export const useColumns = () => {
  const { __ } = useTranslation();
  const getStandardActions = useStandardActions({
    resourceName: "devices"
  });

  const columns: ColumnDef<Device>[] = [
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
              href={route("devices.show", row.original.id)}
            >
              {row.getValue("serial_number")}
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
      accessorKey: "imei",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.imei")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[80px]">{row.getValue("imei")}</div>
      ),
    },
    {
      accessorKey: "device_type",
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
      accessorKey: "vehicle",
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
              //href={route("vehicles.show", row.original.vehicle.id)}
            />
          ) : (
            <span className="text-gray-400">{__("common.none")}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "tenant",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("devices.fields.tenant")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[180px]">
          {row.original.tenant ? (
            <Link
              href={route("tenants.show", row.original.tenant.id)}
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