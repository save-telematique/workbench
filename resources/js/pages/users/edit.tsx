import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { useTranslation } from '@/utils/translation';
import UserForm from '@/components/users/user-form';
import UserPageLayout from '@/components/users/user-page-layout';
import { UserResource } from '@/types/resources';

interface UserEditProps {
    user: UserResource;
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
            href: route('users.show', { user: user.id }),
        },
        {
            title: __('users.edit.breadcrumb'),
            href: route('users.edit', { user: user.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('users.edit.title')} />

            <UsersLayout>
                <UserPageLayout
                    title={__('users.edit.heading', { name: user.name })}
                    description={__('users.edit.description')}
                    backUrl={route('users.show', { user: user.id })}
                    backLabel={__('common.back')}
                >
                    <UserForm
                        user={user}
                        translationNamespace="users"
                        submitUrl={route('users.update', { user: user.id })}
                        cancelUrl={route('users.show', { user: user.id })}
                        isCreate={false}
                    />
                </UserPageLayout>
            </UsersLayout>
        </AppLayout>
    );
} 