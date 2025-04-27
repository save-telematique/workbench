import { Head } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import VehicleForm from "@/components/vehicles/vehicle-form";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface VehicleModel {
  id: string;
  name: string;
  brand_id: string;
  brand_name?: string;
}

interface Vehicle {
  id?: string;
  registration: string;
  brand: string;
  model: string;
  vin: string;
  model_id?: string;
  brand_id?: string;
  tenant_id: string | null;
  device_id: string | null;
}

interface VehicleCreateProps {
  tenants: { id: string; name: string }[];
  devices: { id: string; serial_number: string }[];
  brands: { id: string; name: string }[];
  models: VehicleModel[];
}

export default function Create({ tenants, devices, brands, models }: VehicleCreateProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: __('vehicles.breadcrumbs.create'),
      href: route('vehicles.create'),
    },
  ];

  const vehicle: Vehicle = {
    registration: '',
    brand: '',
    model: '',
    vin: '',
    tenant_id: null,
    device_id: null,
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.actions.create")} />

      <VehiclesLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("vehicles.create.heading")} 
            description={__("vehicles.create.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("vehicles.index")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_list")}
            </a>
          </Button>
        </div>

        <div className="mt-6">
          <VehicleForm
            vehicle={vehicle}
            tenants={tenants}
            devices={devices}
            brands={brands}
            models={models}
            onSuccess={(id) => {
              window.location.href = route('vehicles.show', id);
            }}
          />
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 