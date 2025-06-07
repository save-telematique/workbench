import GeofenceForm from '@/components/geofences/geofence-form';
import AppLayout from '@/layouts/app-layout';
import GeofencesLayout from '@/layouts/geofences/layout';
import { type BreadcrumbItem, GroupResource, TenantResource } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import HeadingSmall from '@/components/heading-small';

interface GeofenceCreateProps {
    tenants: TenantResource[];
    groups: GroupResource[];
}

export default function Create({ tenants, groups }: GeofenceCreateProps) {
    const { __ } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('geofences.breadcrumbs.index'),
            href: route('geofences.index'),
        },
        {
            title: __('geofences.breadcrumbs.create'),
            href: route('geofences.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__("geofences.actions.create")} />

            <GeofencesLayout showSidebar={false}>
                <div className="flex items-center justify-between">
                    <HeadingSmall 
                        title={__("geofences.create.heading")} 
                        description={__("geofences.create.description")} 
                    />
                    <Button variant="outline" asChild>
                        <a href={route("geofences.index")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {__("common.back_to_list")}
                        </a>
                    </Button>
                </div>

                <div className="mt-6">
                    <GeofenceForm
                        tenants={tenants}
                        groups={groups}
                        isCreate={true}
                        onSuccess={() => {
                            // Success handled by the form component
                        }}
                    />
                </div>
            </GeofencesLayout>
        </AppLayout>
    );
}
