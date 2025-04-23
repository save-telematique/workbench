import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { InfoIcon, GlobeIcon } from 'lucide-react';

interface TenantsLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    tenantId?: string;
    activeTab?: 'info' | 'domains';
}

export default function TenantsLayout({ children, showSidebar = false, tenantId, activeTab = 'info' }: TenantsLayoutProps) {
    return (
        <div className="px-4 py-2">
            {showSidebar && tenantId ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-8 mt-6">
                    <aside className="lg:w-48 lg:shrink-0">
                        <nav className="flex flex-col space-y-1 space-x-0">
                            <Link
                                href={route('tenants.show', tenantId)}
                                className={cn(
                                    'flex items-center text-sm px-3 py-2 rounded-md text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white',
                                    activeTab === 'info' && 'bg-muted text-neutral-950 dark:text-white'
                                )}
                            >
                                <InfoIcon className="mr-2 h-4 w-4" />
                                Information
                            </Link>
                            <Link
                                href={`/tenants/${tenantId}/domains`}
                                className={cn(
                                    'flex items-center text-sm px-3 py-2 rounded-md text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white',
                                    activeTab === 'domains' && 'bg-muted text-neutral-950 dark:text-white'
                                )}
                            >
                                <GlobeIcon className="mr-2 h-4 w-4" />
                                Domains
                            </Link>
                        </nav>
                    </aside>

                    <div className="flex-1">
                        <section>{children}</section>
                    </div>
                </div>
            ) : (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
} 