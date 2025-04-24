// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/utils/translation';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const { __ } = useTranslation();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout 
            title={__('auth.verify_email_title')}
            description={__('auth.verify_email_description')}
        >
            <Head title={__('auth.email_verification')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {__('auth.verification_link_sent')}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {__('auth.resend_verification_email')}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    {__('common.logout')}
                </TextLink>
            </form>
        </AuthLayout>
    );
}
