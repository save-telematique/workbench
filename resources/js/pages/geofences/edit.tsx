import { Head } from '@inertiajs/react';
import GeofenceForm from '@/components/geofences/geofence-form';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import GeofencesLayout from '@/layouts/geofences/layout';
import { type BreadcrumbItem, GeofenceResource, GroupResource, TenantResource } from '@/types';
import { useTranslation } from '@/utils/translation';

interface GeofenceEditProps {
    geofence: GeofenceResource;
    tenants: TenantResource[];
    groups: GroupResource[];
}

export default function Edit({ geofence, tenants, groups }: GeofenceEditProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('geofences.breadcrumbs.index'),
            href: route('geofences.index'),
        },
        {
            title: geofence.name,
            href: route('geofences.show', { geofence: geofence.id }),
        },
        {
            title: __('geofences.breadcrumbs.edit'),
            href: route('geofences.edit', { geofence: geofence.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${__('geofences.title')} - ${__('geofences.edit.title')}`} />
            
            <GeofencesLayout geofence={geofence}>
                <div className="space-y-6">
                    <HeadingSmall 
                        title={__('geofences.edit.heading', { name: geofence.name })} 
                        description={__('geofences.edit.description')} 
                    />

                    <GeofenceForm
                        geofence={geofence}
                        tenants={tenants}
                        groups={groups}
                        isCreate={false}
                        onSuccess={() => {
                            // Success handled by the form component
                        }}
                    />
                </div>
            </GeofencesLayout>
        </AppLayout>
    );
}
