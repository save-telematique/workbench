import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { DeviceType, useDeviceTypeColumns } from './columns';

interface Props {
    deviceTypes: DeviceType[];
}

export default function DeviceTypes({ deviceTypes }: Props) {
    const { __ } = useTranslation();
    const columns = useDeviceTypeColumns();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.device_types'),
            href: route('global-settings.device-types.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.device_types')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <HeadingSmall 
                            title={__('common.device_types')} 
                            description={__('common.manage_device_types')} 
                        />
                        <Button asChild>
                            <Link href={route('global-settings.device-types.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                {__('common.create')}
                            </Link>
                        </Button>
                    </div>
                    
                    <DataTable 
                        columns={columns}
                        data={deviceTypes}
                        pagination={true}
                        sorting={true}
                        pageSize={10}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 