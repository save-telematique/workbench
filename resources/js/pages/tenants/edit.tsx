import { TenantResource, type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Save } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import SvgEditor from '@/components/svg-editor';
import { useTranslation } from '@/utils/translation';

interface TenantEditProps {
    tenant: TenantResource;
}

interface TenantForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
    svg_logo: string;
    [key: string]: string | boolean;
}

export default function TenantsEdit({ tenant }: TenantEditProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
        {
            title: __('tenants.edit.breadcrumb', { name: tenant.name }),
            href: route('tenants.edit', { tenant: tenant.id }),
        },
    ];

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<TenantForm>({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        is_active: tenant.is_active,
        svg_logo: tenant.svg_logo || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('tenants.update', { tenant: tenant.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenants.edit.title', { name: tenant.name })} />

            <TenantsLayout showSidebar={true} tenant={tenant}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenants.edit.heading', { name: tenant.name })}
                        description={__('tenants.edit.description')}
                    />

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle>{__('tenants.edit.form_title')}</CardTitle>
                            <CardDescription>{__('tenants.edit.form_description', { name: tenant.name })}</CardDescription>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium">{__('tenants.fields.name')}</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="mt-1"
                                                placeholder={__('tenants.fields.name_placeholder')}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium">{__('tenants.fields.email')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="mt-1"
                                                placeholder={__('tenants.fields.email_placeholder')}
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-medium">{__('tenants.fields.phone')}</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="mt-1"
                                                placeholder={__('tenants.fields.phone_placeholder')}
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="address" className="text-sm font-medium">{__('tenants.fields.address')}</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="mt-1"
                                                placeholder={__('tenants.fields.address_placeholder')}
                                            />
                                            <InputError message={errors.address} />
                                        </div>

                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="is_active" className="text-sm font-medium">
                                                    {__('tenants.fields.status')}
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-neutral-600">
                                                        {data.is_active ? __('tenants.status.active') : __('tenants.status.inactive')}
                                                    </span>
                                                    <Switch
                                                        id="is_active"
                                                        checked={data.is_active}
                                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                                    />
                                                </div>
                                            </div>
                                            <InputError message={errors.is_active} />
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <SvgEditor 
                                        value={data.svg_logo} 
                                        onChange={(value) => setData('svg_logo', value)} 
                                    />
                                    <InputError message={errors.svg_logo} />
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between border-t pt-6">
                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {__('common.save_changes')}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">{__('common.saved')}</p>
                                    </Transition>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 