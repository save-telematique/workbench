import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { setDefaultOptions } from 'date-fns';
import { enGB, fr } from 'date-fns/locale';
interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const locale = usePage<SharedData>().props.auth?.user?.locale;
    setDefaultOptions({ locale: locale === 'en' ? enGB : locale === 'fr' ? fr : fr })
    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
