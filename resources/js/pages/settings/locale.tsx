import { Head } from '@inertiajs/react';

import LocaleTabs from '@/components/locale-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function LocaleSettings() {
    const { __ } = useTranslation();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.language_settings'),
            href: '/settings/locale',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.language_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('common.language_settings')} 
                        description={__('common.update_language_settings')} 
                    />
                    <LocaleTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
} 