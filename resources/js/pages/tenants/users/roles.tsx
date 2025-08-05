import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import HeadingSmall from '@/components/heading-small';
import { TenantResource, UserResource } from '@/types/resources';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    description: string;
}

interface TenantUserRolesProps {
    tenant: TenantResource;
    user: UserResource;
    roles: Role[];
}

export default function TenantUserRoles({ tenant, user, roles }: TenantUserRolesProps) {
    const { __ } = useTranslation();
    
    const form = useForm({
        roles: user.roles || [],
    });

    useEffect(() => {
        form.setData('roles', user.roles || []);
    }, [user.roles]);

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
            title: __('tenant_users.roles.breadcrumb'),
            href: route('tenants.users.roles.edit', { tenant: tenant.id, user: user.id }),
        },
    ];

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('tenants.users.roles.update', { tenant: tenant.id, user: user.id }));
    };

    const toggleRole = (roleName: string) => {
        const currentRoles = form.data.roles || [];
        if (currentRoles.includes(roleName)) {
            form.setData('roles', currentRoles.filter(role => role !== roleName));
        } else {
            form.setData('roles', [...currentRoles, roleName]);
        }
    };

    // Filter to only show tenant roles
    const tenantRoles = roles.filter(role => role.name.startsWith('tenant_'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.roles.title', { name: user.name, tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenant={tenant}>
                <div className="space-y-6">
                    <HeadingSmall
                        title={__('tenant_users.roles.heading')}
                        description={__('tenant_users.roles.description')}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>{__('tenant_users.roles.card_title')}</CardTitle>
                            <CardDescription>
                                {__('tenant_users.roles.card_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">{__('tenant_users.roles.available_roles')}</h3>
                                    {tenantRoles.length > 0 ? (
                                        tenantRoles.map((role) => (
                                            <div key={role.id} className="flex items-start space-x-3 p-4 border rounded-md">
                                                <Checkbox
                                                    checked={form.data.roles.includes(role.name)}
                                                    onCheckedChange={() => toggleRole(role.name)}
                                                />
                                                <div className="space-y-1 leading-none">
                                                    <div className="text-sm font-semibold">
                                                        {role.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {role.description}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            {__('tenant_users.roles.no_roles_available')}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-4">
                            <Button onClick={onSubmit} disabled={form.processing}>
                                {form.processing ? __('common.saving') : __('common.save')}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </TenantsLayout>
        </AppLayout>
    );
}