import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import HeadingSmall from '@/components/heading-small';
import { UserResource } from '@/types/resources';

interface Role {
    id: number;
    name: string;
    description: string;
}

interface UserRolesProps {
    user: UserResource;
    roles: Role[];
}

export default function UserRoles({ user, roles }: UserRolesProps) {
    const { __ } = useTranslation();
    
    const form = useForm({
        roles: user.roles || [],
    });

    useEffect(() => {
        form.setData('roles', user.roles || []);
    }, [user.roles]);

    const breadcrumbs = [
        {
            title: __('users.list.breadcrumb'),
            href: route('users.index'),
        },
        {
            title: __('users.show.breadcrumb', { name: user.name }),
            href: route('users.show', { user: user.id }),
        },
        {
            title: __('users.roles.breadcrumb'),
            href: route('users.roles.edit', { user: user.id }),
        },
    ];

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('users.roles.update', { user: user.id }));
    };

    const toggleRole = (roleName: string) => {
        const currentRoles = form.data.roles || [];
        if (currentRoles.includes(roleName)) {
            form.setData('roles', currentRoles.filter(role => role !== roleName));
        } else {
            form.setData('roles', [...currentRoles, roleName]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.roles.title', { name: user.name })} />

            <UsersLayout showSidebar={true} user={user}>
                <div className="space-y-6">
                    <HeadingSmall
                        title={__('users.roles.heading')}
                        description={__('users.roles.description')}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>{__('users.roles.card_title')}</CardTitle>
                            <CardDescription>
                                {user.tenant_id 
                                    ? __('users.roles.card_description_tenant') 
                                    : __('users.roles.card_description_central')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-6">
                                {!user.tenant_id && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">{__('users.roles.central_roles')}</h3>
                                        {roles.map((role) => (
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
                                        ))}
                                    </div>
                                )}
                                
                                {user.tenant_id && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">{__('users.roles.tenant_roles')}</h3>
                                        {roles.map((role) => (
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
                                        ))}
                                    </div>
                                )}
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-4">
                            <Button onClick={onSubmit} disabled={form.processing}>
                                {form.processing ? __('common.saving') : __('common.save')}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </UsersLayout>
        </AppLayout>
    );
} 