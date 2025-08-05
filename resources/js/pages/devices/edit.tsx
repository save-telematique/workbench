import { Head } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DevicesLayout from "@/layouts/devices/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, DeviceResource, DeviceTypeResource, TenantResource, VehicleResource } from "@/types";
import DeviceForm from "@/components/devices/device-form";

interface DeviceEditProps {
  device: DeviceResource;
  deviceTypes: DeviceTypeResource[];
  tenants: TenantResource[];
  vehicles: Pick<VehicleResource, 'id' | 'registration' | 'tenant_id'>[];
}

export default function Edit({ device, deviceTypes, tenants, vehicles }: DeviceEditProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.breadcrumbs.show', { serial: device.serial_number }),
      href: route('devices.show', { device: device.id }),
    },
    {
      title: __('devices.breadcrumbs.edit'),
      href: route('devices.edit', { device: device.id }),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("devices.actions.edit", { serial: device.serial_number })} />

      <DevicesLayout showSidebar={true} device={device}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("devices.edit.heading", { serial: device.serial_number })} 
            description={__("devices.edit.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("devices.show", { device: device.id })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_list")}
            </a>
          </Button>
        </div>

        <div className="mt-6">
          <DeviceForm
            device={device}
            deviceTypes={deviceTypes}
            tenants={tenants}
            vehicles={vehicles}
          />
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 