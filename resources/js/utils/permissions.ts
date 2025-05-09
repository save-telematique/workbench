import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    tenant_id: string | null;
    permissions: string[];
    roles: string[];
    [key: string]: unknown;
}

interface Auth {
    user: User | null;
}

interface PageProps {
    auth: Auth;
    [key: string]: unknown;
}

/**
 * Check if the user has a specific permission
 * @param permission The permission to check (e.g., 'view_users')
 * @returns Boolean indicating if the user has the permission
 */
export function usePermission(permission: string): boolean {
    const { auth } = usePage<PageProps>().props;
    
    if (!auth.user) {
        return false;
    }
    
    return auth.user.permissions.includes(permission);
}

/**
 * Check if the user has a specific role
 * @param role The role to check (e.g., 'super_admin')
 * @returns Boolean indicating if the user has the role
 */
export function useRole(role: string): boolean {
    const { auth } = usePage<PageProps>().props;
    
    if (!auth.user) {
        return false;
    }
    
    return auth.user.roles.includes(role);
}

/**
 * Check if user has any of the provided permissions
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has any of the permissions
 */
export function useHasAnyPermission(permissions: string[]): boolean {
    const { auth } = usePage<PageProps>().props;
    
    if (!auth.user) {
        return false;
    }
    
    return permissions.some(permission => auth.user?.permissions.includes(permission));
}

/**
 * Check if current user is a tenant user
 * @returns Boolean indicating if the user belongs to a tenant
 */
export function useTenantUser(): boolean {
    const { auth } = usePage<PageProps>().props;
    
    if (!auth.user) {
        return false;
    }
    
    return auth.user.tenant_id !== null;
} 