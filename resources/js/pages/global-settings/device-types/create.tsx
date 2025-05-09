import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import DeviceTypeForm from '@/components/global-settings/device-type-form';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';

export default function Create() {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.device_types'),
            href: route('global-settings.device-types.index'),
        },
        {
            title: __('common.create_device_type'),
            href: route('global-settings.device-types.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.create_device_type')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.create_device_type')} 
                            description={__('common.manage_device_types')} 
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('global-settings.device-types.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back_to_list')}
                            </Link>
                        </Button>
                    </div>
                    
                    <DeviceTypeForm 
                        type={{}}
                        isCreate={true}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 