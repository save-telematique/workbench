import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { X, ArrowLeft, Pencil, Save, CheckCircle, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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
import { useTranslation } from '@/utils/translation';
import { Badge } from '@/components/ui/badge';

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
    const { __ } = useTranslation();

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
            title: __('tenants.list.breadcrumb'),
            href: route('tenants.index'),
        },
        {
            title: __('tenants.show.breadcrumb', { name: tenant.name }),
            href: route('tenants.show', tenant.id),
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
            <Head title={__('tenants.show.title', { name: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenants.show.heading')}
                        description={__('tenants.show.description')}
                    />
                    
                    <div className="flex justify-end space-x-2">
                        {!isEditing ? (
                            <>
                                <Button  onClick={() => setIsEditing(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {__('common.edit')}
                                </Button>
                                <Button variant="outline"  asChild>
                                    <Link href={route('tenants.index')}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {__('tenants.actions.back_to_list')}
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline"  onClick={() => {
                                setIsEditing(false);
                                reset();
                            }}>
                                <X className="mr-2 h-4 w-4" />
                                {__('common.cancel')}
                            </Button>
                        )}
                    </div>

                    {isEditing ? (
                        // Mode édition
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
                                                />
                                                <InputError message={errors.phone} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="address" className="text-sm font-medium">{__('tenants.fields.address')}</Label>
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
                                                        {__('tenants.fields.status_label')}
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-neutral-600">
                                                            {data.is_active ? __('common.active') : __('common.inactive')}
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
                                            <p className="text-sm text-neutral-600">{__('tenants.messages.updated')}</p>
                                        </Transition>
                                        
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {__('common.save_changes')}
                                        </Button>
                                    </div>
                                </CardFooter>
                            </form>
                        </Card>
                    ) : (
                        // Mode affichage
                        <Card>
                            <CardHeader>
                                <CardTitle>{__('tenants.show.info_section_title')}</CardTitle>
                                <CardDescription>{__('tenants.show.description')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">{__('tenants.fields.name')}</TableCell>
                                            <TableCell>{tenant.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">{__('tenants.fields.email')}</TableCell>
                                            <TableCell>{tenant.email || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">{__('tenants.fields.phone')}</TableCell>
                                            <TableCell>{tenant.phone || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">{__('tenants.fields.address')}</TableCell>
                                            <TableCell>{tenant.address || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">{__('tenants.fields.status')}</TableCell>
                                            <TableCell>
                                                {tenant.is_active ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        {__('common.active')}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        {__('common.inactive')}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {tenant.svg_logo && (
                                            <TableRow>
                                                <TableCell className="font-medium">{__('tenants.fields.logo')}</TableCell>
                                                <TableCell>
                                                    <div 
                                                        className="w-28 h-28 border rounded p-2 flex items-center justify-center"
                                                        dangerouslySetInnerHTML={{ __html: tenant.svg_logo }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 