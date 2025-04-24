import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    const { __ } = useTranslation();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.appearance_settings'),
            href: route('settings.appearance'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.appearance_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('common.appearance_settings')} 
                        description={__('common.update_appearance_settings')} 
                    />
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-medium mb-3">{__('common.theme')}</h3>
                            <AppearanceTabs />
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
