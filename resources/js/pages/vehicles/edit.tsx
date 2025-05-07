import { Head } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "@/utils/translation";
import AppLayout from '@/layouts/app-layout';
import VehiclesLayout from "@/layouts/vehicles/layout";
import HeadingSmall from '@/components/heading-small';
import VehicleForm from "@/components/vehicles/vehicle-form";



interface VehicleModel {
  id: string;
  name: string;
  brand_id: string;
  brand_name?: string;
}

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  vin: string;
  model_id?: string;
  brand_id?: string;
  tenant_id: string | null;
  device_id: string | null;
}

interface VehicleEditProps {
  vehicle: Vehicle;
  tenants: { id: string; name: string }[];
  devices: { id: string; serial_number: string }[];
  brands: { id: string; name: string }[];
  models: VehicleModel[];
}

export default function Edit({ vehicle, tenants, devices, brands, models }: VehicleEditProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: __('vehicles.breadcrumbs.edit'),
      href: route('vehicles.edit', vehicle.id),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.actions.edit")} />

      <VehiclesLayout vehicleId={vehicle.id}>
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
            onSuccess={() => {
              window.location.href = route('vehicles.show', vehicle.id);
            }}
          />
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 