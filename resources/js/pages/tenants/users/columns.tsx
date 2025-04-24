"use client"

import { useUserColumns } from '@/components/users/user-columns';

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
export function useTenantUsersColumns(tenantId: string) {
  return useUserColumns({
    baseRoute: 'tenants.users',
    tenantId,
    translationNamespace: 'tenant_users',
  });
} 