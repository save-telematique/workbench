import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import EmailVerificationStatus from '@/components/email-verification-status';
import FormattedDate from '@/components/formatted-date';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle 
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslation } from '@/utils/translation';

type ProfileForm = {
    name: string;
    email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { __ } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('settings.profile.breadcrumb'),
            href: route('profile.edit'),
        },
    ];

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('settings.profile.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('settings.profile.heading')} 
                        description={__('settings.profile.description')} 
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{__('settings.profile.name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder={__('settings.profile.name_placeholder')}
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{__('settings.profile.email')}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={__('settings.profile.email_placeholder')}
                            />

                            <InputError className="mt-2" message={errors.email} />
                            
                            <EmailVerificationStatus
                                isVerified={auth.user.email_verified_at !== null}
                                verifiedAt={auth.user.email_verified_at}
                                resendRoute={mustVerifyEmail && auth.user.email_verified_at === null ? route('verification.send') : undefined}
                                verificationStatus={status}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{__('common.save')}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">{__('common.saved')}</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>{__('settings.profile.account_info')}</CardTitle>
                        <CardDescription>{__('settings.profile.account_details')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-muted-foreground">{__('settings.profile.account_created')}</div>
                                <div>
                                    <FormattedDate 
                                        date={auth.user.created_at} 
                                        format="DATE_FULL" 
                                        className="font-medium" 
                                    />
                                </div>
                                
                                <div className="text-muted-foreground">{__('settings.profile.last_updated')}</div>
                                <div>
                                    <FormattedDate 
                                        date={auth.user.updated_at} 
                                        format="DATETIME_FULL" 
                                        className="font-medium" 
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
