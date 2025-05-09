import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import VehicleBrandForm from '@/components/global-settings/vehicle-brand-form';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';

interface Props {
    vehicleBrand: {
        id: number;
        name: string;
        logo_url: string;
    };
}

export default function Edit({ vehicleBrand }: Props) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_brands'),
            href: route('global-settings.vehicle-brands.index'),
        },
        {
            title: __('common.edit_vehicle_brand'),
            href: route('global-settings.vehicle-brands.edit', { vehicle_brand: vehicleBrand.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.edit_vehicle_brand')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.edit_vehicle_brand')} 
                            description={__('common.manage_vehicle_brands')} 
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('global-settings.vehicle-brands.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back_to_list')}
                            </Link>
                        </Button>
                    </div>
                    
                    <VehicleBrandForm 
                        brand={vehicleBrand}
                        isCreate={false}
                    />
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 