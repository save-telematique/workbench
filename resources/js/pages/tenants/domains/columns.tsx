'use client';

import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DomainResource } from '@/types';
import { usePermission } from '@/utils/permissions';
import { useTranslation } from '@/utils/translation';
// Fonction utilitaire pour déterminer si un domaine contient un point (domaine complet vs sous-domaine)
export function isDomainWithDot(domain: string): boolean {
    return domain.includes('.');
}

// Fonction pour construire l'URL complète pour un domaine
export function getDomainUrl(domain: string, appHostname: string | null): string {
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
}

// Hook pour les colonnes
export function useDomainsColumns(tenantId: string, appHostname: string | null): ColumnDef<DomainResource>[] {
    const { __ } = useTranslation();
    const canDeleteDomains = usePermission('delete_tenant_domains');

    // Ouvrir le domaine dans un nouvel onglet
    const openDomainInNewTab = (domain: string) => {
        window.open(getDomainUrl(domain, appHostname), '_blank', 'noopener,noreferrer');
    };

    return [
        {
            accessorKey: 'domain',
            header: ({ column }) => <DataTableColumnHeader column={column} title={__('tenants.domains.table_header_domain')} />,
            cell: ({ row }) => {
                const domain = row.getValue('domain') as string;
                return (
                    <div>
                        <div className="font-medium">{domain}</div>
                        {!isDomainWithDot(domain) && appHostname && (
                            <div
                                className="mt-1 text-xs text-neutral-500"
                                dangerouslySetInnerHTML={{
                                    __html: __('tenants.domains.subdomain_usage_note', { domain: `${domain}.${appHostname}` }),
                                }}
                            />
                        )}
                    </div>
                );
            },
        },
        {
            id: 'type',
            accessorKey: 'domain',
            header: ({ column }) => <DataTableColumnHeader column={column} title={__('tenants.domains.table_header_type')} />,
            cell: ({ row }) => {
                const domain = row.getValue('domain') as string;
                const isDomainFull = isDomainWithDot(domain);
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isDomainFull ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}
                    >
                        {isDomainFull ? __('tenants.domains.type_full') : __('tenants.domains.type_subdomain')}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const domain = row.original;

                return (
                    <div className="flex justify-end space-x-1">
                        <Button
                            variant="ghost"
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => openDomainInNewTab(domain.domain)}
                            title={__('tenants.domains.actions.open_tooltip')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">{__('tenants.domains.actions.open')}</span>
                        </Button>
                        {canDeleteDomains && (
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                    if (confirm(__('tenants.domains.actions.delete_confirm'))) {
                                        router.delete(route('tenants.domains.destroy', { tenant: tenantId, domain: domain.id }), { preserveScroll: true });
                                    }
                                }}
                                title={__('tenants.domains.actions.delete_tooltip')}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{__('common.delete')}</span>
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];
}
