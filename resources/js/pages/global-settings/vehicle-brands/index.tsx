import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/index';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleBrand, useVehicleBrandColumns } from './columns';

interface BreadcrumbItem {
    title: string;
    href: string;
}

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
                    <HeadingSmall 
                        title={__('common.vehicle_brands')} 
                        description={__('common.manage_vehicle_brands')} 
                    />
                    
                    <DataTable 
                        columns={columns}
                        data={vehicleBrands}
                        tableId="vehicle-brands-table"
                        config={{
                            pagination: true,
                            sorting: true,
                            pageSize: 10
                        }}
                        actionBarRight={
                            <Button asChild size="default" className="h-9">
                                <Link href={route('global-settings.vehicle-brands.create')}>
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