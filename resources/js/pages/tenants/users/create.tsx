import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import UserForm from '@/components/users/user-form';

interface TenantUserCreateProps {
    tenant: {
        id: string;
        name: string;
    };
}

export default function TenantUserCreate({ tenant }: TenantUserCreateProps) {
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
            title: __('tenant_users.create.breadcrumb'),
            href: route('tenants.users.create', tenant.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.create.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id} activeTab="users">
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenant_users.create.heading')} 
                        description={__('tenant_users.create.description')} 
                    />
                    
                    <div className="flex justify-end">
                        <Button variant="outline" asChild>
                            <Link href={route('tenants.users.index', tenant.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('tenant_users.actions.back_to_list')}
                            </Link>
                        </Button>
                    </div>
                    
                    <UserForm
                        translationNamespace="tenant_users"
                        submitUrl={route('tenants.users.store', tenant.id)}
                        cancelUrl={route('tenants.users.index', tenant.id)}
                    />
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 