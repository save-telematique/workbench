import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/utils/translation';

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
    
    const { data, setData, post, processing, errors, progress } = useForm({
        name: vehicleBrand.name,
        logo: null as File | null,
        _method: 'PUT',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_brands'),
            href: route('global-settings.vehicle-brands.index'),
        },
        {
            title: __('common.edit_vehicle_brand'),
            href: route('global-settings.vehicle-brands.edit', vehicleBrand.id),
        },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData('logo', e.target.files[0]);
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('global-settings.vehicle-brands.update', vehicleBrand.id), {
            forceFormData: true,
        });
    };

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
                                <Label htmlFor="logo">{__('common.logo')}</Label>
                                {vehicleBrand.logo_url && (
                                    <div className="mt-2 mb-4">
                                        <p className="text-sm text-gray-500 mb-2">{__('common.current_logo')}:</p>
                                        <img 
                                            src={vehicleBrand.logo_url} 
                                            alt={vehicleBrand.name} 
                                            className="h-16 w-16 object-contain border rounded-md p-1"
                                        />
                                    </div>
                                )}
                                <Input
                                    id="logo"
                                    type="file"
                                    className="mt-1 block w-full"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                {progress && (
                                    <progress value={progress.percentage} max="100" className="mt-2 w-full">
                                        {progress.percentage}%
                                    </progress>
                                )}
                                <p className="text-sm text-gray-500 mt-1">{__('common.leave_empty_to_keep_current_logo')}</p>
                                <InputError message={errors.logo} className="mt-2" />
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