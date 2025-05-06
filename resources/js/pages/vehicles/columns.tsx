import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { useTranslation } from "@/utils/translation";
import { Link } from "@inertiajs/react";
import { LicensePlate } from "@/components/ui/license-plate";
import { useStandardActions } from "@/utils/actions";

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  color: string;
  vin: string;
  year: number;
  tenant?: {
    id: string;
    name: string;
  };
  device?: {
    id: string;
    serial_number: string;
  };
  deleted_at: string | null;
}

export const useColumns = () => {
  const { __ } = useTranslation();
  const getStandardActions = useStandardActions({
    resourceName: "vehicles"
  });

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "registration",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("vehicles.fields.registration")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Link
              href={route("vehicles.show", row.original.id)}
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
      accessorKey: "tenant",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("vehicles.fields.tenant")}
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
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("vehicles.fields.brand")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[100px]">{row.getValue("brand")}</div>
      ),
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("vehicles.fields.model")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[120px]">{row.getValue("model")}</div>
      ),
    },
    {
      accessorKey: "vin",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("vehicles.fields.vin")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[130px]">{row.getValue("vin")}</div>
      ),
    },
    {
      accessorKey: "device",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={__("vehicles.fields.device")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-[180px]">
          {row.original.device ? (
            <Link
              href={route("devices.show", row.original.device.id)}
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