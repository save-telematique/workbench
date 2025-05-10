import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from "@/types";
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { useVehicleModelColumns } from './columns';
import { ResourceCollection, VehicleModelResource } from '@/types/resources';


interface Props {
    vehicleModels: ResourceCollection<VehicleModelResource>;
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
                    <HeadingSmall 
                        title={__('common.vehicle_models')} 
                        description={__('common.manage_vehicle_models')} 
                    />
                    
                    <DataTable 
                        columns={columns}
                        data={vehicleModels.data || []}
                        tableId="vehicle-models-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            pageSize: vehicleModels.meta?.per_page || 10
                        }}
                        actionBarRight={
                            <Button asChild size="default" className="h-9">
                                <Link href={route('global-settings.vehicle-models.create')}>
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
