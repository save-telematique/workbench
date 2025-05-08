import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from "@/types";
import { ArrowLeft, CheckCircle, Pencil, Shield, UserRound, XCircle } from 'lucide-react';
import { useState } from 'react';

import FormattedDate from '@/components/formatted-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { usePermission } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';
import HeadingSmall from '@/components/heading-small';


interface UserShowProps {
    user: {
        id: number;
        name: string;
        email: string;
        locale: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
        roles: string[];
        permissions: string[];
    };
}

export default function UserShow({ user }: UserShowProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { __ } = useTranslation();
    const canEditUsers = usePermission('edit_users');
    const canDeleteUsers = usePermission('delete_users');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('users.list.breadcrumb'),
            href: route('users.index'),
        },
        {
            title: __('users.show.breadcrumb', { name: user.name }),
            href: route('users.show', user.id),
        },
    ];

    const handleDelete = () => {
        router.delete(route('users.destroy', user.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.show.title', { name: user.name })} />

            <UsersLayout showSidebar={true} userId={user.id}>
                <div className="space-y-6">
                    <HeadingSmall
                        title={__('users.show.heading')}
                        description={__('users.show.description')}
                    />
                    
                    <div className="flex justify-end space-x-2">
                        {canEditUsers && (
                            <Button asChild>
                                <Link href={route('users.edit', user.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {__('users.actions.edit')}
                                </Link>
                            </Button>
                        )}

                        {canDeleteUsers && (
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">{__('users.actions.delete')}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{__('common.confirm_delete')}</DialogTitle>
                                        <DialogDescription>{__('common.confirm_delete_description')}</DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                            {__('common.cancel')}
                                        </Button>
                                        <Button variant="destructive" onClick={handleDelete}>
                                            {__('common.delete')}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Button variant="outline" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('users.actions.back_to_list')}
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>{__('users.show.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">{__('users.fields.name')}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{__('users.fields.email')}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{__('users.fields.email_verified')}</TableCell>
                                        <TableCell>
                                            {user.email_verified_at ? (
                                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    {__('users.fields.email_verified_badge')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    {__('users.fields.email_not_verified_badge')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{__('users.fields.locale')}</TableCell>
                                        <TableCell>{user.locale === 'fr' ? 'Français' : 'English'}</TableCell>
                                    </TableRow>
                                    {user.email_verified_at && (
                                        <TableRow>
                                            <TableCell className="font-medium">{__('users.fields.email_verified_at')}</TableCell>
                                            <TableCell>
                                                <FormattedDate date={user.email_verified_at} format="DATE_MED" />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell className="font-medium">{__('users.fields.created_at')}</TableCell>
                                        <TableCell>
                                            <FormattedDate date={user.created_at} format="DATE_MED" />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{__('users.fields.updated_at')}</TableCell>
                                        <TableCell>
                                            <FormattedDate date={user.updated_at} format="DATE_MED" />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            <Separator className="my-6" />

                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-2 flex items-center text-lg font-medium">
                                        <UserRound className="mr-2 h-5 w-5" />
                                        {__('users.fields.roles')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <Badge key={role} variant="secondary">
                                                    {role}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm">{__('users.no_roles')}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-2 flex items-center text-lg font-medium">
                                        <Shield className="mr-2 h-5 w-5" />
                                        {__('users.fields.permissions')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.permissions.length > 0 ? (
                                            user.permissions.map((permission) => (
                                                <Badge key={permission} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                    {permission}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm">{__('users.no_permissions')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </UsersLayout>
        </AppLayout>
    );
}
