import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleBrand, useVehicleBrandColumns } from './columns';

interface Props {
    vehicleBrands: VehicleBrand[];
}

export default function VehicleBrands({ vehicleBrands }: Props) {
    const { __ } = useTranslation();
    const columns = useVehicleBrandColumns();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_brands'),
            href: route('global-settings.vehicle-brands.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.vehicle_brands')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <HeadingSmall 
                            title={__('common.vehicle_brands')} 
                            description={__('common.manage_vehicle_brands')} 
                        />
                        <Button asChild>
                            <Link href={route('global-settings.vehicle-brands.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                {__('common.create')}
                            </Link>
                        </Button>
                    </div>
                    
                    <DataTable 
                        columns={columns}
                        data={vehicleBrands}
                        tableId="vehicle-brands-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            pageSize: 10
                        }}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 