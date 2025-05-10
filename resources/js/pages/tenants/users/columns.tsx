"use client"

import { useUserColumns } from '@/components/users/user-columns';

export function useTenantUsersColumns(tenantId: string) {
  return useUserColumns({
    tenantId,
    translationNamespace: 'tenant_users',
  });
} 