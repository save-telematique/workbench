import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import UserForm from '@/components/users/user-form';
import UserPageLayout from '@/components/users/user-page-layout';
import { TenantResource } from '@/types/resources';

interface TenantUserCreateProps {
    tenant: TenantResource;
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
            href: route('tenants.show', { tenant: tenant.id }),
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: route('tenants.users.index', { tenant: tenant.id }),
        },
        {
            title: __('tenant_users.create.breadcrumb'),
            href: route('tenants.users.create', { tenant: tenant.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.create.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenant={tenant}>
                <UserPageLayout
                    title={__('tenant_users.create.heading')}
                    description={__('tenant_users.create.description')}
                    backUrl={route('tenants.users.index', { tenant: tenant.id })}
                    backLabel={__('tenant_users.actions.back_to_list')}
                >
                    <UserForm
                        translationNamespace="tenant_users"
                        submitUrl={route('tenants.users.store', { tenant: tenant.id })}
                        cancelUrl={route('tenants.users.index', { tenant: tenant.id })}
                        isCreate={true}
                    />
                </UserPageLayout>
            </TenantsLayout>
        </AppLayout>
    );
} 