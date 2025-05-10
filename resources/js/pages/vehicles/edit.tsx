import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, VehicleResource, TenantResource, DeviceResource, VehicleBrandResource, VehicleModelResource, VehicleTypeResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import AppLayout from '@/layouts/app-layout';
import VehiclesLayout from "@/layouts/vehicles/layout";
import HeadingSmall from '@/components/heading-small';
import VehicleForm from "@/components/vehicles/vehicle-form";

interface VehicleEditProps {
  vehicle: VehicleResource;
  tenants: TenantResource[];
  devices: DeviceResource[];
  brands: VehicleBrandResource[];
  models: VehicleModelResource[];
  vehicleTypes: VehicleTypeResource[];
}

export default function Edit({ vehicle, tenants, devices, brands, models, vehicleTypes }: VehicleEditProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: __('vehicles.breadcrumbs.edit'),
      href: route('vehicles.edit', { vehicle: vehicle.id }),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.actions.edit")} />

      <VehiclesLayout vehicle={vehicle}>
        <div className="space-y-6">
          <HeadingSmall 
            title={__("vehicles.edit.heading", { registration: vehicle.registration || '' })}
            description={__("vehicles.edit.description")}
          />

          <VehicleForm
            vehicle={vehicle}
            tenants={tenants}
            devices={devices}
            brands={brands}
            models={models}
            vehicleTypes={vehicleTypes}
          />
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 