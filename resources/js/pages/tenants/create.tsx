import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from '@/utils/translation';

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

export default function TenantsCreate() {
    const { __ } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.breadcrumb'),
            href: '/tenants',
        },
        {
            title: __('tenants.create.breadcrumb'),
            href: '/tenants/create',
        },
    ];

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        is_active: true,
        svg_logo: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('tenants.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenants.create.page_title')} />

            <TenantsLayout showSidebar={false}>
                <div className="flex items-center justify-between">
                    <HeadingSmall 
                        title={__('tenants.create.heading.title')} 
                        description={__('tenants.create.heading.description')} 
                    />
                    <Button variant="outline" asChild>
                        <a href={route('tenants.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {__('common.back_to_list')}
                        </a>
                    </Button>
                </div>

                <Card className="mt-6">
                    <CardHeader className="pb-4">
                        <CardTitle>{__('tenants.create.card.title')}</CardTitle>
                        <CardDescription>{__('tenants.create.card.description')}</CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            {__('tenants.form.name')}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className="mt-1"
                                            placeholder={__('tenants.form.name_placeholder')}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            {__('tenants.form.email')}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1"
                                            placeholder={__('tenants.form.email_placeholder')}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" className="text-sm font-medium">
                                            {__('tenants.form.phone')}
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-1"
                                            placeholder={__('tenants.form.phone_placeholder')}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="address" className="text-sm font-medium">
                                            {__('tenants.form.address')}
                                        </Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="mt-1"
                                            placeholder={__('tenants.form.address_placeholder')}
                                        />
                                        <InputError message={errors.address} />
                                    </div>

                                    <div className="mt-4 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="is_active" className="text-sm font-medium">
                                                {__('tenants.form.status')}
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-neutral-600">
                                                    {data.is_active 
                                                        ? __('common.status.active') 
                                                        : __('common.status.inactive')
                                                    }
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
                            <Button 
                                variant="outline" 
                                type="button" 
                                onClick={() => window.location.href = route('tenants.index')}
                            >
                                {__('common.cancel')}
                            </Button>
                            
                            <div className="flex items-center gap-4">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">
                                        {__('tenants.create.success_message')}
                                    </p>
                                </Transition>
                                
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {__('tenants.create.submit_button')}
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </TenantsLayout>
        </AppLayout>
    );
} 