"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, CheckCircle, XCircle } from "lucide-react"
import { Link } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { useTranslation } from "@/utils/translation"

// Type pour définir la structure de nos données
export interface Tenant {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
}

// Composant React pour les colonnes
export function useTenantsColumns(): ColumnDef<Tenant>[] {
  const { __ } = useTranslation()

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenants.fields.name')} 
        />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenants.fields.email')} 
        />
      ),
      cell: ({ row }) => <div>{row.getValue("email") || "-"}</div>,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenants.fields.phone')} 
        />
      ),
      cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenants.fields.status_label')} 
        />
      ),
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
        const tenant = row.original
        
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={route('tenants.show', tenant.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">{__('common.view')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={route('tenants.edit', tenant.id)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{__('common.edit')}</span>
              </Link>
            </Button>
          </div>
        )
      },
    },
  ]
} 