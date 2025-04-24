import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import UserForm from '@/components/users/user-form';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';

export default function UserCreate() {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('users.list.breadcrumb'),
            href: route('users.index'),
        },
        {
            title: __('users.create.breadcrumb'),
            href: route('users.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.create.title')} />

            <UsersLayout>
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button variant="outline" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('users.actions.back_to_list')}
                            </Link>
                        </Button>
                    </div>

                    <UserForm translationNamespace="users" submitUrl={route('users.store')} cancelUrl={route('users.index')} />
                </div>
            </UsersLayout>
        </AppLayout>
    );
}
