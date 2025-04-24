import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';

import AppLayout from '@/layouts/app-layout';
import GlobalSettingsLayout from '@/layouts/global-settings/layout';
import { VehicleBrand } from '../vehicle-brands/columns';
import { VehicleType } from '../vehicle-types/columns';

interface Props {
    vehicleBrands: VehicleBrand[];
    vehicleTypes: VehicleType[];
}

export default function Create({ vehicleBrands, vehicleTypes }: Props) {
    const { __ } = useTranslation();
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        year: new Date().getFullYear(),
        description: '',
        vehicle_brand_id: '',
        vehicle_type_id: '',
    });

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

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('global-settings.vehicle-models.store'), {
            onSuccess: () => reset(),
        });
    };

    // Get the current year for the year select
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
                                <Label htmlFor="year">{__('common.year')}</Label>
                                <Select
                                    value={data.year.toString()}
                                    onValueChange={(value) => setData('year', parseInt(value))}
                                >
                                    <SelectTrigger id="year" className="mt-1 w-full">
                                        <SelectValue placeholder={__('common.select_year')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.year} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="vehicle_brand_id">{__('common.brand')}</Label>
                                <Select
                                    value={data.vehicle_brand_id.toString()}
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

                            <div>
                                <Label htmlFor="vehicle_type_id">{__('common.type')}</Label>
                                <Select
                                    value={data.vehicle_type_id.toString()}
                                    onValueChange={(value) => setData('vehicle_type_id', value)}
                                >
                                    <SelectTrigger id="vehicle_type_id" className="mt-1 w-full">
                                        <SelectValue placeholder={__('common.select_type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.vehicle_type_id} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="description">{__('common.description')}</Label>
                                <Textarea
                                    id="description"
                                    className="mt-1 block w-full"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {__('common.create')}
                            </Button>
                        </div>
                    </form>
                </div>
            </GlobalSettingsLayout>
        </AppLayout>
    );
} 