import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import UserForm from '@/components/users/user-form';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import UserPageLayout from '@/components/users/user-page-layout';

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
                <UserPageLayout
                    title={__('users.create.heading')}
                    description={__('users.create.description')}
                    backUrl={route('users.index')}
                    backLabel={__('users.actions.back_to_list')}
                >
                    <UserForm 
                        submitUrl={route('users.store')} 
                        cancelUrl={route('users.index')}
                        isCreate={true}
                    />
                </UserPageLayout>
            </UsersLayout>
        </AppLayout>
    );
}
