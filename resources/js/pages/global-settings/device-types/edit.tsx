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
    deviceType: {
        id: number;
        name: string;
        manufacturer: string;
    };
}

export default function Edit({ deviceType }: Props) {
    const { __ } = useTranslation();
    
    const { data, setData, patch, processing, errors } = useForm({
        name: deviceType.name,
        manufacturer: deviceType.manufacturer,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('common.device_types'),
            href: route('global-settings.device-types.index'),
        },
        {
            title: __('common.edit_device_type'),
            href: route('global-settings.device-types.edit', deviceType.id),
        },
    ];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('global-settings.device-types.update', deviceType.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('common.edit_device_type')} />

            <GlobalSettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title={__('common.edit_device_type')} 
                            description={__('common.manage_device_types')} 
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('global-settings.device-types.index')}>
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
                                <Label htmlFor="manufacturer">{__('common.manufacturer')}</Label>
                                <Input
                                    id="manufacturer"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.manufacturer}
                                    onChange={(e) => setData('manufacturer', e.target.value)}
                                    required
                                />
                                <InputError message={errors.manufacturer} className="mt-2" />
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