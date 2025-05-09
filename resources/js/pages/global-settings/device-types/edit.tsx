import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import DeviceTypeForm from '@/components/global-settings/device-type-form';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { DeviceTypeResource } from '@/types/resources';

interface Props {
    deviceType: DeviceTypeResource;
}

export default function Edit({ deviceType }: Props) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.device_types'),
            href: route('global-settings.device-types.index'),
        },
        {
            title: __('common.edit_device_type'),
            href: route('global-settings.device-types.edit', { device_type: deviceType.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.edit_device_type')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.edit_device_type')} 
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
                        type={deviceType}
                        isCreate={false}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 