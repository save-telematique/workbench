"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil } from "lucide-react"
import { Link } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { useTranslation } from "@/utils/translation"
import EmailVerificationCompact from "@/components/email-verification-compact"
import FormattedDate from "@/components/formatted-date"

// Type pour définir la structure de nos données
export interface TenantUser {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

// Hook pour les colonnes
export function useTenantUsersColumns(tenantId: string): ColumnDef<TenantUser>[] {
  const { __ } = useTranslation()

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenant_users.fields.name')} 
        />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenant_users.fields.email')} 
        />
      ),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "email_verified_at",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenant_users.fields.email_verified')} 
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <EmailVerificationCompact 
            isVerified={row.getValue("email_verified_at") !== null}
            verifiedAt={row.getValue("email_verified_at")}
          />
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenant_users.fields.created_at')} 
        />
      ),
      cell: ({ row }) => (
        <FormattedDate 
          date={row.getValue("created_at")} 
          format="DATE_MED" 
        />
      ),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={__('tenant_users.fields.updated_at')} 
        />
      ),
      cell: ({ row }) => (
        <FormattedDate 
          date={row.getValue("updated_at")} 
          format="DATE_MED" 
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={route('tenants.users.show', [tenantId, user.id])}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">{__('common.view')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={route('tenants.users.edit', [tenantId, user.id])}>
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