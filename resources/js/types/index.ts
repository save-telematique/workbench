import { ComponentType } from "react";
import { LucideProps } from "lucide-react";

export type LucideIcon = ComponentType<LucideProps>;

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      tenant_id: string | null;
      permissions: string[];
      roles: string[];
      [key: string]: unknown;
    } | null;
  };
  errors: Record<string, string>;
  flash: {
    success?: string;
    error?: string;
    [key: string]: unknown;
  };
} & T; 