import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, Pencil, Eye, Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';

interface TenantsIndexProps {
    tenants: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        is_active: boolean;
    }[];
}

export default function TenantsIndex({ tenants }: TenantsIndexProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
    ];
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenants.list.title')} />

            <TenantsLayout showSidebar={false}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenants.list.heading')} 
                        description={__('tenants.list.description')} 
                    />
                    
                    <div className="flex justify-end">
                        <Button asChild size="sm">
                            <Link href={route('tenants.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                {__('tenants.list.add_tenant')}
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                                    <th className="px-4 py-3">{__('tenants.fields.name')}</th>
                                    <th className="px-4 py-3">{__('tenants.fields.email')}</th>
                                    <th className="px-4 py-3">{__('tenants.fields.phone')}</th>
                                    <th className="px-4 py-3">{__('tenants.fields.status_label')}</th>
                                    <th className="w-[120px] px-4 py-3">{__('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Building2 className="h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-semibold text-gray-900">{__('tenants.list.no_tenants')}</h3>
                                                <p className="mt-1 text-sm text-gray-500">{__('tenants.list.get_started')}</p>
                                                <div className="mt-6">
                                                    <Button asChild>
                                                        <Link href={route('tenants.create')}>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            {__('tenants.list.create_tenant')}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    tenants.map((tenant) => (
                                        <tr key={tenant.id} className="border-b last:border-none hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                                            <td className="whitespace-nowrap px-4 py-3 font-medium">{tenant.name}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{tenant.email || '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{tenant.phone || '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {tenant.is_active ? __('common.active') : __('common.inactive')}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <div className="flex space-x-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('tenants.show', tenant.id)}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">{__('common.view')}</span>
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('tenants.edit', tenant.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">{__('common.edit')}</span>
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 