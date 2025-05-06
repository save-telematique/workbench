import { Eye, ExternalLink, MoreHorizontal, Pencil } from "lucide-react";
import { Link } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

import { Tenant } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/utils/translation";

// Custom components for headers and cells to properly use the useTranslation hook
function SelectHeader({ table }: { table: any }) {
  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  );
}

function SelectCell({ row }: { row: any }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  );
}

function SortableHeader({ column, translationKey }: { column: any; translationKey: string }) {
  const { __ } = useTranslation();
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {__(translationKey)}
    </Button>
  );
}

function TenantNameCell({ row }: { row: any }) {
  const tenant = row.original;
  return (
    <div className="flex items-center">
      <Link
        href={route("tenants.show", tenant.id)}
        className="hover:underline"
      >
        {tenant.name}
      </Link>
    </div>
  );
}

function DomainCell({ row }: { row: any }) {
  const domain = row.getValue("domain") as string;
  return (
    <a
      href={`https://${domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-600 hover:underline"
    >
      {domain}
      <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );
}

function StatusCell({ row }: { row: any }) {
  const { __ } = useTranslation();
  const isActive = row.getValue("active") as boolean;
  
  return (
    <div className="flex justify-center">
      {isActive ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {__("tenants.status.active")}
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {__("tenants.status.inactive")}
        </Badge>
      )}
    </div>
  );
}

function DateCell({ row }: { row: any }) {
  const locale = document.documentElement.lang === "fr" ? fr : enUS;
  const created_at = new Date(row.getValue("created_at") as string);
  const formatted = format(created_at, "PPp", { locale });
  return <div>{formatted}</div>;
}

function ActionsCell({ row }: { row: any }) {
  const { __ } = useTranslation();
  const tenant = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{__("common.open_menu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{__("common.actions_header")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={route("tenants.show", tenant.id)}>
            <Eye className="mr-2 h-4 w-4" />
            {__("tenants.actions.view")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={route("tenants.edit", tenant.id)}>
            <Pencil className="mr-2 h-4 w-4" />
            {__("tenants.actions.edit")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const TenantColumns: ColumnDef<Tenant>[] = [
  {
    id: "select",
    header: ({ table }) => <SelectHeader table={table} />,
    cell: ({ row }) => <SelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} translationKey="tenants.fields.id" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} translationKey="tenants.fields.name" />,
    cell: ({ row }) => <TenantNameCell row={row} />,
  },
  {
    accessorKey: "domain",
    header: ({ column }) => <SortableHeader column={column} translationKey="tenants.fields.domain" />,
    cell: ({ row }) => <DomainCell row={row} />,
  },
  {
    accessorKey: "active",
    header: ({ column }) => <SortableHeader column={column} translationKey="tenants.fields.status" />,
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column} translationKey="tenants.fields.created_at" />,
    cell: ({ row }) => <DateCell row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]; 