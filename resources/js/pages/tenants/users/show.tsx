import { useState } from 'react';
import { TenantResource, UserResource, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Mail, Calendar, Globe, Trash, Clock, CheckCircle, XCircle } from 'lucide-react';

import FormattedDate from '@/components/formatted-date';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/utils/permissions';

interface TenantUserShowProps {
    tenant: TenantResource;
    user: UserResource;
}

export default function TenantUserShow({ tenant, user }: TenantUserShowProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { __ } = useTranslation();
    const canEditTenantUsers = usePermission('edit_tenant_users');
    const canDeleteTenantUsers = usePermission('delete_tenant_users');

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
    ];

    const handleDelete = () => {
        router.delete(route('tenants.users.destroy', { tenant: tenant.id, user: user.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.show.title', { name: user.name, tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenant={tenant}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenant_users.show.heading')} 
                        description={__('tenant_users.show.description')} 
                    />
                    
                    <div className="flex justify-end space-x-2">
                        {canEditTenantUsers && (
                            <Button asChild>
                                <Link href={route('tenants.users.edit', { tenant: tenant.id, user: user.id })}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {__('tenant_users.actions.edit')}
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={route('tenants.users.index', { tenant: tenant.id })}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('tenant_users.actions.back_to_list')}
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle>{user.name}</CardTitle>
                                <div>
                                    {user.email_verified_at ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {__('tenant_users.fields.email_verified_badge')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            {__('tenant_users.fields.email_not_verified_badge')}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <CardDescription>
                                <span className="flex items-center">
                                    <Mail className="mr-2 h-4 w-4 text-neutral-500" />
                                    {user.email}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 border-t pt-6">
                            <div>
                                <p className="text-sm font-medium text-neutral-500">{__('tenant_users.fields.created_at')}</p>
                                <p className="flex items-center mt-1 text-neutral-900">
                                    <Calendar className="mr-2 h-4 w-4 text-neutral-500" />
                                    <FormattedDate 
                                        date={user.created_at} 
                                        format="DATETIME_FULL" 
                                        className="font-medium" 
                                    />
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500">{__('tenant_users.fields.updated_at')}</p>
                                <p className="flex items-center mt-1 text-neutral-900">
                                    <Clock className="mr-2 h-4 w-4 text-neutral-500" />
                                    <FormattedDate 
                                        date={user.updated_at} 
                                        format="DATETIME_FULL" 
                                        className="font-medium" 
                                    />
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500">{__('tenant_users.fields.locale')}</p>
                                <p className="flex items-center mt-1 text-neutral-900">
                                    <Globe className="mr-2 h-4 w-4 text-neutral-500" />
                                    {user.locale === 'fr' ? 'Français' : 'English'}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                            {canDeleteTenantUsers && (
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash className="mr-2 h-4 w-4" />
                                            {__('tenant_users.actions.delete')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{__('common.confirm_delete')}</DialogTitle>
                                            <DialogDescription>
                                                {__('common.delete_confirmation', { item: user.name })}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('common.cancel')}</Button>
                                            </DialogClose>
                                            <Button variant="destructive" onClick={handleDelete}>
                                                {__('common.delete')}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 