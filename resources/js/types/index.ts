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

export interface PageProps<T = Record<string, unknown>> {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      [key: string]: unknown;
    };
  };
  errors: Record<string, string>;
  flash: {
    success?: string;
    error?: string;
    [key: string]: unknown;
  };
} & T; 