import { ComponentType } from "react";
import { LucideProps } from "lucide-react";
import type { Config as ZiggyConfig } from 'ziggy-js';
// Export resource types
export * from './resources';

export type LucideIcon = ComponentType<LucideProps>;

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface Tenant {
    id: string;
    name: string;
    svg_logo?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    tenant: Tenant;
    tenant_id: string | null;
    permissions: string[];
    roles: string[];
    [key: string]: unknown;
}

export interface Auth {
    user: User | null;
}

export interface SharedData {
    auth: Auth;
    errors: Record<string, string>;
    flash: {
        success?: string;
        error?: string;
        message?: string;
        warning?: string;
        [key: string]: unknown;
    };
    ziggy: ZiggyConfig & { location: string };
    locale: string;
    name?: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = SharedData & T; 