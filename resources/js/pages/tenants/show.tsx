import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Building2, Mail, Phone, MapPin, Check, X, ArrowLeft, Pencil, Save, CircleCheck } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import SvgEditor from '@/components/svg-editor';

interface TenantShowProps {
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

export default function TenantsShow({ tenant }: TenantShowProps) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
        name: tenant.name,
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        is_active: tenant.is_active,
        svg_logo: tenant.svg_logo || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tenants',
            href: '/tenants',
        },
        {
            title: tenant.name,
            href: `/tenants/${tenant.id}`,
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        patch(route('tenants.update', tenant.id), {
            onSuccess: () => {
                setTimeout(() => {
                    setIsEditing(false);
                }, 1000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tenant: ${tenant.name}`} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id} activeTab="info">
                <div className="flex items-center justify-between mb-6">
                    <HeadingSmall title="Tenant Information" description="View and manage tenant details" />
                    <div className="flex space-x-2">
                        {!isEditing ? (
                            <>
                                <Button size="sm" onClick={() => setIsEditing(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('tenants.index')}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to list
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => {
                                setIsEditing(false);
                                reset();
                            }}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    // Mode édition
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
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                rows={4}
                                                className="mt-1"
                                            />
                                            <InputError message={errors.address} />
                                        </div>

                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="is_active" className="text-sm font-medium flex items-center">
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
                                <Button type="button" variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    reset();
                                }}>
                                    Cancel
                                </Button>
                                
                                <div className="flex items-center gap-4">
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Changes saved successfully</p>
                                    </Transition>
                                    
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                ) : (
                    // Mode affichage
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid gap-8 md:grid-cols-2">
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                                        Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Building2 className="mr-3 h-5 w-5 text-neutral-500 mt-0.5" />
                                            <div>
                                                <span className="block font-medium text-base">{tenant.name}</span>
                                                <div className="flex items-center mt-1 text-sm text-neutral-600">
                                                    <span className="inline-flex items-center">
                                                        Status: {tenant.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {tenant.email && (
                                            <div className="flex items-center">
                                                <Mail className="mr-3 h-5 w-5 text-neutral-500" />
                                                <a href={`mailto:${tenant.email}`} className="text-neutral-700 dark:text-neutral-300 hover:underline">
                                                    {tenant.email}
                                                </a>
                                            </div>
                                        )}
                                        
                                        {tenant.phone && (
                                            <div className="flex items-center">
                                                <Phone className="mr-3 h-5 w-5 text-neutral-500" />
                                                <a href={`tel:${tenant.phone}`} className="text-neutral-700 dark:text-neutral-300 hover:underline">
                                                    {tenant.phone}
                                                </a>
                                            </div>
                                        )}
                                        
                                        {tenant.address && (
                                            <div className="flex items-start">
                                                <MapPin className="mr-3 h-5 w-5 text-neutral-500 mt-0.5" />
                                                <div className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{tenant.address}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {tenant.svg_logo && (
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                                            Logo
                                        </h3>
                                        <div className="p-6 border rounded-md flex justify-center items-center bg-neutral-50 dark:bg-neutral-900 h-[200px]">
                                            <div className="max-w-full max-h-[160px]" dangerouslySetInnerHTML={{ __html: tenant.svg_logo }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TenantsLayout>
        </AppLayout>
    );
} 