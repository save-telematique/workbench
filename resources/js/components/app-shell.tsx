import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { setDefaultOptions } from 'date-fns';
import { enGB, fr } from 'date-fns/locale';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const locale = usePage<SharedData>().props.auth?.user?.locale;
    const flash = usePage<SharedData>().props.flash;

    useEffect(() => {
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
    })

    setDefaultOptions({ locale: locale === 'en' ? enGB : locale === 'fr' ? fr : fr });

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={isOpen}>
            {children}
            <Toaster />
        </SidebarProvider>
    );
}
