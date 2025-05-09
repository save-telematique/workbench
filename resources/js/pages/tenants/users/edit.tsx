import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import UserForm from '@/components/users/user-form';
import UserPageLayout from '@/components/users/user-page-layout';
import { TenantResource, UserResource } from '@/types/resources';

interface TenantUserEditProps {
    tenant: TenantResource;
    user: UserResource;
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
            href: route('tenants.show', { tenant: tenant.id }),
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: route('tenants.users.index', { tenant: tenant.id }),
        },
        {
            title: __('tenant_users.show.breadcrumb', { name: user.name }),
            href: route('tenants.users.show', { tenant: tenant.id, user: user.id }),
        },
        {
            title: __('tenant_users.edit.breadcrumb'),
            href: route('tenants.users.edit', { tenant: tenant.id, user: user.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.edit.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id}>
                <UserPageLayout
                    title={__('tenant_users.edit.heading', { name: user.name })}
                    description={__('tenant_users.edit.description')}
                    backUrl={route('tenants.users.show', { tenant: tenant.id, user: user.id })}
                    backLabel={__('common.back')}
                >
                    <UserForm
                        user={user}
                        translationNamespace="tenant_users"
                        submitUrl={route('users.update', { user: user.id })}
                        cancelUrl={route('tenants.users.show', { tenant: tenant.id, user: user.id })}
                        isCreate={false}
                    />
                </UserPageLayout>
            </TenantsLayout>
        </AppLayout>
    );
} 