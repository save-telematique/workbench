import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleModel, useVehicleModelColumns } from './columns';

interface Props {
    vehicleModels: VehicleModel[];
}

export default function VehicleModels({ vehicleModels }: Props) {
    const { __ } = useTranslation();
    const columns = useVehicleModelColumns();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_models'),
            href: route('global-settings.vehicle-models.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.vehicle_models')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <HeadingSmall 
                            title={__('common.vehicle_models')} 
                            description={__('common.manage_vehicle_models')} 
                        />
                        <Button asChild>
                            <Link href={route('global-settings.vehicle-models.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                {__('common.create')}
                            </Link>
                        </Button>
                    </div>
                    
                    <DataTable 
                        columns={columns}
                        data={vehicleModels}
                        pagination={true}
                        sorting={true}
                        pageSize={10}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 