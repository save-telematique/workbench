import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from "@/types";
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/utils/translation';
import VehicleModelForm from '@/components/global-settings/vehicle-model-form';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleBrandResource } from "@/types/resources";


interface Props {
    vehicleBrands: VehicleBrandResource[];
}

export default function Create({ vehicleBrands }: Props) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_models'),
            href: route('global-settings.vehicle-models.index'),
        },
        {
            title: __('common.create_vehicle_model'),
            href: route('global-settings.vehicle-models.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.create_vehicle_model')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.create_vehicle_model')} 
                            description={__('common.manage_vehicle_models')} 
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('global-settings.vehicle-models.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back_to_list')}
                            </Link>
                        </Button>
                    </div>
                    
                    <VehicleModelForm 
                        model={{}}
                        brands={vehicleBrands}
                        isCreate={true}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 
