"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/ui/data-table"
import { useTranslation } from "@/utils/translation"
import { useStandardActions } from "@/utils/actions"
import { TenantResource } from "@/types"

export function useTenantsColumns(): ColumnDef<TenantResource>[] {
  const { __ } = useTranslation()
  const getStandardActions = useStandardActions({
    resourceName: "tenants"
  })

  return [
    {
      accessorKey: "name",
      header: __('tenants.fields.name'),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: __('tenants.fields.email'),
      cell: ({ row }) => <div>{row.getValue("email") || "-"}</div>,
    },
    {
      accessorKey: "phone",
      header: __('tenants.fields.phone'),
      cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
    },
    {
      accessorKey: "is_active",
      header: __('tenants.fields.status_label'),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active")
        return (
          isActive ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {__('common.active')}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <XCircle className="h-3 w-3 mr-1" />
              {__('common.inactive')}
            </Badge>
          )
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tenant = { ...row.original, resourceName: "tenants" }
        
        return (
          <DataTableRowActions
            row={row}
            actions={getStandardActions(tenant)}
            menuLabel={__("common.actions_header")}
          />
        )
      },
    },
  ]
} 