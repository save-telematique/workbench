import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import FormattedDate from '@/components/formatted-date';
import { Badge } from '@/components/ui/badge';

interface UserShowProps {
    user: {
        id: string;
        name: string;
        email: string;
        locale: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
    };
}

export default function UserShow({ user }: UserShowProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { __ } = useTranslation();

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

            <UsersLayout>
                <div className="space-y-6">
                    <div className="flex justify-end space-x-2">
                        <Button asChild>
                            <Link href={route('users.edit', user.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {__('users.actions.edit')}
                            </Link>
                        </Button>
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
                            <CardDescription>{user.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {__('users.fields.email')}
                                    </p>
                                    <p>{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {__('users.fields.email_verified')}
                                    </p>
                                    {user.email_verified_at ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {__('users.fields.email_verified_badge')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            {__('users.fields.email_not_verified_badge')}
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {__('users.fields.locale')}
                                    </p>
                                    <p>{user.locale === 'fr' ? 'Français' : 'English'}</p>
                                </div>
                                {user.email_verified_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {__('users.fields.email_verified_at')}
                                        </p>
                                        <FormattedDate date={user.email_verified_at} format="DATE_MED" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {__('users.fields.created_at')}
                                    </p>
                                    <FormattedDate date={user.created_at} format="DATE_MED" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {__('users.fields.updated_at')}
                                    </p>
                                    <FormattedDate date={user.updated_at} format="DATE_MED" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-4">
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        {__('users.actions.delete')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{__('common.confirm_delete')}</DialogTitle>
                                        <DialogDescription>
                                            {__('common.confirm_delete_description')}
                                        </DialogDescription>
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
                        </CardFooter>
                    </Card>
                </div>
            </UsersLayout>
        </AppLayout>
    );
} 