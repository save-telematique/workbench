import { Head } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DevicesLayout from "@/layouts/devices/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, DeviceTypeResource, TenantResource, VehicleResource } from "@/types";
import DeviceForm from "@/components/devices/device-form";

interface DeviceCreateProps {
  deviceTypes: DeviceTypeResource[];
  tenants: TenantResource[];
  vehicles: Pick<VehicleResource, 'id' | 'registration' | 'tenant_id'>[];
}

export default function Create({ deviceTypes, tenants, vehicles }: DeviceCreateProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.breadcrumbs.create'),
      href: route('devices.create'),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("devices.actions.create")} />

      <DevicesLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("devices.create.heading")} 
            description={__("devices.create.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("devices.index")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_list")}
            </a>
          </Button>
        </div>

        <div className="mt-6">
          <DeviceForm
            device={{}}
            deviceTypes={deviceTypes}
            tenants={tenants}
            vehicles={vehicles}
            isCreate={true}
          />
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 