import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import UserForm from '@/components/users/user-form';

interface UserEditProps {
    user: {
        id: string;
        name: string;
        email: string;
        locale: string;
    };
}

export default function UserEdit({ user }: UserEditProps) {
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
        {
            title: __('users.edit.breadcrumb'),
            href: route('users.edit', user.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.edit.title')} />

            <UsersLayout>
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button variant="outline"  asChild>
                            <Link href={route('users.show', user.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back')}
                            </Link>
                        </Button>
                    </div>
                    
                    <UserForm
                        user={user}
                        translationNamespace="users"
                        submitUrl={route('users.update', user.id)}
                        cancelUrl={route('users.show', user.id)}
                    />
                </div>
            </UsersLayout>
        </AppLayout>
    );
} 