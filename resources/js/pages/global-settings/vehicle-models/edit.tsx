import { Head, useForm, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from "@/types";
import { FormEvent, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { useTranslation } from '@/utils/translation';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleModel } from './columns';
import { VehicleBrand } from '../vehicle-brands/columns';


interface Props {
    vehicleModel: VehicleModel;
    vehicleBrands: VehicleBrand[];
}

export default function Edit({ vehicleModel, vehicleBrands }: Props) {
    const { __ } = useTranslation();
    
    const { data, setData, patch, processing, errors } = useForm({
        name: vehicleModel.name,
        vehicle_brand_id: '',
    });

    useEffect(() => {
        if (vehicleModel && vehicleModel.vehicle_brand_id) {
            setData('vehicle_brand_id', vehicleModel.vehicle_brand_id.toString());
        }
    }, [vehicleModel]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_models'),
            href: route('global-settings.vehicle-models.index'),
        },
        {
            title: __('common.edit_vehicle_model'),
            href: route('global-settings.vehicle-models.edit', vehicleModel.id),
        },
    ];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('global-settings.vehicle-models.update', vehicleModel.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.edit_vehicle_model')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.edit_vehicle_model')} 
                            description={__('common.manage_vehicle_models')} 
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('global-settings.vehicle-models.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('common.back_to_list')}
                            </Link>
                        </Button>
                    </div>
                    
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">{__('common.name')}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="vehicle_brand_id">{__('common.brand')}</Label>
                                <Select
                                    value={data.vehicle_brand_id}
                                    onValueChange={(value) => setData('vehicle_brand_id', value)}
                                >
                                    <SelectTrigger id="vehicle_brand_id" className="mt-1 w-full">
                                        <SelectValue placeholder={__('common.select_brand')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleBrands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.vehicle_brand_id} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {__('common.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 
