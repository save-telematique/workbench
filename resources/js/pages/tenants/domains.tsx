import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Globe, Plus, ArrowLeft, Info } from 'lucide-react';
import { FormEventHandler, useMemo } from 'react';
import { Transition } from '@headlessui/react';
import { useTranslation } from '@/utils/translation';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import TenantsLayout from '@/layouts/tenants/layout';
import { DataTable } from '@/components/ui/data-table';
import { Domain, useDomainsColumns } from './domains/columns';

interface TenantsDomainsProps {
    tenant: {
        id: string;
        name: string;
    };
    domains: Domain[];
    app_url: string;
}

export default function TenantsDomains({ tenant, domains = [], app_url }: TenantsDomainsProps) {
    const { __ } = useTranslation();

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
            title: __('tenants.domains.breadcrumb'),
            href: route('tenants.domains.index', tenant.id),
        },
    ];

    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
        domain: '',
    });

    // Extraire le nom d'hôte de l'URL de l'application
    const appHostname = useMemo(() => {
        try {
            return new URL(app_url).hostname;
        } catch {
            return null;
        }
    }, [app_url]);

    // Déterminer si le domaine saisi est un sous-domaine (sans point)
    const isSubdomain = useMemo(() => 
        data.domain && !data.domain.includes('.'),
    [data.domain]);

    // Preview de ce à quoi ressemblera le domaine si c'est un sous-domaine
    const subdomainPreview = useMemo(() => 
        isSubdomain && appHostname ? `${data.domain}.${appHostname}` : null,
    [isSubdomain, data.domain, appHostname]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('tenants.domains.store', tenant.id), {
            onSuccess: () => reset(),
        });
    };

    // Obtenir les colonnes de la table
    const columns = useDomainsColumns(tenant.id, appHostname);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('tenants.domains.title', { name: tenant.name })} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id} activeTab="domains">
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('tenants.domains.heading')}
                        description={__('tenants.domains.description')}
                    />
                    <div className="flex justify-end">
                        <Button variant="outline"  asChild>
                            <Link href={route('tenants.show', tenant.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {__('tenants.actions.back_to_tenant')}
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <h3 className="text-lg font-medium mb-4">{__('tenants.domains.add_domain_title')}</h3>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="domain">{__('tenants.domains.domain_name_label')}</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            id="domain"
                                            value={data.domain}
                                            onChange={(e) => setData('domain', e.target.value)}
                                            required
                                            placeholder={__('tenants.domains.domain_name_placeholder')}
                                        />
                                        <div className="flex items-center mt-2 text-xs text-neutral-500">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="flex items-center">
                                                        <Info className="h-3.5 w-3.5 mr-1" />
                                                        <span>{__('tenants.domains.domain_format_tooltip_trigger')}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-sm">
                                                        <div dangerouslySetInnerHTML={{
                                                            __html: __('tenants.domains.domain_format_tooltip_content', { hostname: appHostname })
                                                        }} />
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        {isSubdomain && subdomainPreview && (
                                            <p 
                                                className="mt-2 text-sm text-blue-600"
                                                dangerouslySetInnerHTML={{
                                                    __html: __('tenants.domains.subdomain_preview', { preview: subdomainPreview })
                                                }}
                                            />
                                        )}
                                        <InputError message={errors.domain} />
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {__('tenants.domains.add_domain_button')}
                                    </Button>
                                </div>
                            </div>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">{__('tenants.domains.messages.added')}</p>
                            </Transition>
                        </form>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <h3 className="text-lg font-medium mb-4">{__('tenants.domains.existing_domains_title')}</h3>
                        {domains.length === 0 ? (
                            <div className="py-4 text-center">
                                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{__('tenants.domains.no_domains')}</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{__('tenants.domains.get_started')}</p>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={domains}
                                pagination={false}
                                sorting={true}
                                noResultsMessage={__('tenants.domains.no_domains')}
                            />
                        )}
                    </div>
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 