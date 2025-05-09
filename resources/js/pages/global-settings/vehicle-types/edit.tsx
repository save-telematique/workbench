import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import VehicleTypeForm from '@/components/global-settings/vehicle-type-form';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleTypeResource } from '@/types/resources';

interface Props {
    vehicleType: VehicleTypeResource;
}

export default function Edit({ vehicleType }: Props) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_types'),
            href: route('global-settings.vehicle-types.index'),
        },
        {
            title: __('common.edit_vehicle_type'),
            href: route('global-settings.vehicle-types.edit', { vehicle_type: vehicleType.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.edit_vehicle_type')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.edit_vehicle_type')} 
                            description={__('common.manage_vehicle_types')} 
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('global-settings.vehicle-types.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back_to_list')}
                            </Link>
                        </Button>
                    </div>
                    
                    <VehicleTypeForm 
                        type={vehicleType}
                        isCreate={false}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 