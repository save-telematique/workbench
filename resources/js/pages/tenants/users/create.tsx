import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { ArrowLeft } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { useTranslation } from '@/utils/translation';

interface TenantUserCreateProps {
    tenant: {
        id: string;
        name: string;
    };
}

export default function TenantUserCreate({ tenant }: TenantUserCreateProps) {
    const { __ } = useTranslation();

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        locale: 'fr',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
        {
            title: __('tenants.show.breadcrumb', { name: tenant.name }),
            href: route('tenants.show', tenant.id),
        },
        {
            title: __('tenant_users.list.breadcrumb'),
            href: route('tenants.users.index', tenant.id),
        },
        {
            title: __('tenant_users.create.breadcrumb'),
            href: route('tenants.users.create', tenant.id),
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tenants.users.store', tenant.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenant_users.create.title', { tenant: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id} activeTab="users">
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenant_users.create.heading')} 
                        description={__('tenant_users.create.description')} 
                    />
                    
                    <div className="flex justify-end">
                        <Button variant="outline"  asChild>
                            <Link href={route('tenants.users.index', tenant.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('tenant_users.actions.back_to_list')}
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle>{__('tenant_users.create.form_title')}</CardTitle>
                            <CardDescription>{__('tenant_users.create.form_description')}</CardDescription>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium">{__('tenant_users.fields.name')}</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium">{__('tenant_users.fields.email')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div>
                                            <Label htmlFor="password" className="text-sm font-medium">{__('tenant_users.fields.password')}</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium">{__('tenant_users.fields.password_confirmation')}</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <div>
                                            <Label htmlFor="locale" className="text-sm font-medium">{__('tenant_users.fields.locale')}</Label>
                                            <Select
                                                value={data.locale}
                                                onValueChange={(value) => setData('locale', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fr">Français</SelectItem>
                                                    <SelectItem value="en">English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.locale} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex items-center justify-between space-x-2 pt-6">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600">{__('tenant_users.messages.created')}</p>
                                </Transition>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {__('tenant_users.actions.create')}
                                    </Button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 