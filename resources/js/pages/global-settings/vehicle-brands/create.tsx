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

export default function Create() {
    const { __ } = useTranslation();
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.vehicle_brands'),
            href: route('global-settings.vehicle-brands.index'),
        },
        {
            title: __('common.create_vehicle_brand'),
            href: route('global-settings.vehicle-brands.create'),
        },
    ];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('global-settings.vehicle-brands.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.create_vehicle_brand')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.create_vehicle_brand')} 
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