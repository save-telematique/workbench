import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import UserForm from '@/components/users/user-form';

interface TenantUserEditProps {
    tenant: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
        locale: string;
    };
}

export default function TenantUserEdit({ tenant, user }: TenantUserEditProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
        {
            title: __('tenants.show.breadcrumb', { name: tenant.name }),
            href: route('tenants.show', tenant.id),
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: route('tenants.users.index', tenant.id),
        },
        {
            title: __('tenant_users.show.breadcrumb', { name: user.name }),
            href: route('tenants.users.show', [tenant.id, user.id]),
        },
        {
            title: __('tenant_users.edit.breadcrumb'),
            href: route('tenants.users.edit', [tenant.id, user.id]),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.edit.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id} activeTab="users">
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenant_users.edit.heading')} 
                        description={__('tenant_users.edit.description')} 
                    />
                    
                    <div className="flex justify-end">
                        <Button variant="outline"  asChild>
                            <Link href={route('tenants.users.show', [tenant.id, user.id])}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back')}
                            </Link>
                        </Button>
                    </div>
                    
                    <UserForm
                        user={user}
                        translationNamespace="tenant_users"
                        submitUrl={route('tenants.users.update', [tenant.id, user.id])}
                        cancelUrl={route('tenants.users.show', [tenant.id, user.id])}
                    />
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 