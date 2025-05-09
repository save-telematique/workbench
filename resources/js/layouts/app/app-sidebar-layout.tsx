import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SharedData, type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const flash = usePage<SharedData>().props.flash;

    if (flash?.success) {
        toast.success(flash.success);
    }

    if (flash?.error) {
        toast.error(flash.error);
    }

    if (flash?.message) {
        toast.message(flash.message);
    }

    if (flash?.warning) {
        toast.warning(flash.warning);
    }
    
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
                <Toaster />
            </AppContent>
        </AppShell>
    );
}
