import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleType, useVehicleTypeColumns } from './columns';

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface Props {
    vehicleTypes: VehicleType[];
}

export default function VehicleTypes({ vehicleTypes }: Props) {
    const { __ } = useTranslation();
    const columns = useVehicleTypeColumns();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_types'),
            href: route('global-settings.vehicle-types.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.vehicle_types')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('common.vehicle_types')} 
                        description={__('common.manage_vehicle_types')} 
                    />
                    
                    <DataTable 
                        columns={columns}
                        data={vehicleTypes}
                        tableId="vehicle-types-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            pageSize: 10
                        }}
                        actionBarRight={
                            <Button asChild size="default" className="h-9">
                                <Link href={route('global-settings.vehicle-types.create')}>
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