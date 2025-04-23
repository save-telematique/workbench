import { type BreadcrumbItem } from '@/types';
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

interface TenantEditProps {
    tenant: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        is_active: boolean;
        svg_logo: string | null;
    };
}

interface TenantForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
    svg_logo: string;
}

export default function TenantsEdit({ tenant }: TenantEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tenants',
            href: '/tenants',
        },
        {
            title: tenant.name,
            href: `/tenants/${tenant.id}/edit`,
        },
    ];

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<TenantForm>({
        name: tenant.name,
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        is_active: tenant.is_active,
        svg_logo: tenant.svg_logo || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('tenants.update', tenant.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Tenant: ${tenant.name}`} />

            <TenantsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={`Edit Tenant: ${tenant.name}`} description="Update tenant information" />

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle>Edit tenant information</CardTitle>
                            <CardDescription>Update the details for {tenant.name}</CardDescription>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="mt-1"
                                                placeholder="Company name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="mt-1"
                                                placeholder="contact@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="mt-1"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="mt-1"
                                                placeholder="123 Main St, City, Country"
                                            />
                                            <InputError message={errors.address} />
                                        </div>

                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="is_active" className="text-sm font-medium">
                                                    Status
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-neutral-600">
                                                        {data.is_active ? 'Active' : 'Inactive'}
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
                                        Save Changes
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
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