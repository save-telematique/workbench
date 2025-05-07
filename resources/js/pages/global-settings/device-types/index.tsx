import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { DeviceType, useDeviceTypeColumns } from './columns';

interface BreadcrumbItem {
    title: string;
    href: string;
}

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
                    <HeadingSmall 
                        title={__('common.device_types')} 
                        description={__('common.manage_device_types')} 
                    />
                    
                    <DataTable 
                        columns={columns}
                        data={deviceTypes}
                        tableId="device-types-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            pageSize: 10
                        }}
                        actionBarRight={
                            <Button asChild size="default" className="h-9">
                                <Link href={route('global-settings.device-types.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {__('common.create')}
                                </Link>
                            </Button>
                        }
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 