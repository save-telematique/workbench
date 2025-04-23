import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Globe, Plus, ArrowLeft, Trash2, Info, ExternalLink } from 'lucide-react';
import { FormEventHandler, useMemo } from 'react';
import { Transition } from '@headlessui/react';

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

interface TenantsDomainsProps {
    tenant: {
        id: string;
        name: string;
    };
    domains: {
        id: string;
        domain: string;
    }[];
    app_url: string;
}

export default function TenantsDomains({ tenant, domains = [], app_url }: TenantsDomainsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tenants',
            href: '/tenants',
        },
        {
            title: tenant.name,
            href: `/tenants/${tenant.id}`,
        },
        {
            title: 'Domains',
            href: `/tenants/${tenant.id}/domains`,
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

    const isDomainWithDot = (domain: string) => domain.includes('.');

    // Fonction pour construire l'URL complète pour un domaine
    const getDomainUrl = (domain: string) => {
        // Si le domaine contient déjà un point, c'est un domaine complet
        if (isDomainWithDot(domain)) {
            return `https://${domain}`;
        }
        
        // Sinon c'est un sous-domaine à combiner avec l'hôte de l'application
        if (appHostname) {
            return `https://${domain}.${appHostname}`;
        }
        
        // Fallback au cas où
        return `https://${domain}`;
    };

    // Ouvrir le domaine dans un nouvel onglet
    const openDomainInNewTab = (domain: string) => {
        window.open(getDomainUrl(domain), '_blank', 'noopener,noreferrer');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tenant Domains: ${tenant.name}`} />

            <TenantsLayout showSidebar={true} tenantId={tenant.id} activeTab="domains">
                <div className="flex items-center justify-between mb-6">
                    <HeadingSmall title="Tenant Domains" description="Manage domains for this tenant" />
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('tenants.show', tenant.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to tenant
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 mb-6">
                    <h3 className="text-lg font-medium mb-4">Add New Domain</h3>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain Name</Label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        id="domain"
                                        value={data.domain}
                                        onChange={(e) => setData('domain', e.target.value)}
                                        required
                                        placeholder="example.com or subdomain"
                                    />
                                    <div className="flex items-center mt-2 text-xs text-neutral-500">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="flex items-center">
                                                    <Info className="h-3.5 w-3.5 mr-1" />
                                                    <span>Domain format</span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-sm">
                                                    <p>
                                                        Use a full domain with a dot (example.com) or just a subdomain name (demo).
                                                        <br /><br />
                                                        Full domains are saved as-is, while subdomains will be used as <code className="px-1 py-0.5 rounded">[subdomain].{appHostname}</code> in your application.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    {isSubdomain && subdomainPreview && (
                                        <p className="mt-2 text-sm text-blue-600">
                                            Your subdomain will be used as: <span className="font-semibold">{subdomainPreview}</span>
                                        </p>
                                    )}
                                    <InputError message={errors.domain} />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Domain
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
                            <p className="text-sm text-green-600">Domain added successfully.</p>
                        </Transition>
                    </form>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <h3 className="text-lg font-medium mb-4">Existing Domains</h3>
                    {domains.length === 0 ? (
                        <div className="py-4 text-center">
                            <Globe className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No domains</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding a domain above.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                                        <th className="px-4 py-3">Domain</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="w-[120px] px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {domains.map((domain) => (
                                        <tr key={domain.id} className="border-b last:border-none hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                                            <td className="whitespace-nowrap px-4 py-3 font-medium">
                                                {domain.domain}
                                                {!isDomainWithDot(domain.domain) && appHostname && (
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        Will be used as: <span className="font-medium">{domain.domain}.{appHostname}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isDomainWithDot(domain.domain) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
                                                    {isDomainWithDot(domain.domain) ? 'Full domain' : 'Subdomain'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                                <div className="flex justify-end space-x-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={() => openDomainInNewTab(domain.domain)}
                                                        title="Open in new tab"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="sr-only">Open</span>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this domain?')) {
                                                                const url = route('tenants.domains.destroy', [tenant.id, domain.id]);
                                                                window.location.href = `${url}?_method=DELETE`;
                                                            }
                                                        }}
                                                        title="Delete domain"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </TenantsLayout>
        </AppLayout>
    );
} 