import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, TenantResource, DeviceResource, VehicleBrandResource, VehicleModelResource, VehicleTypeResource, GroupResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import VehicleForm from "@/components/vehicles/vehicle-form";

interface VehicleCreateProps {
  tenants: TenantResource[];
  devices: DeviceResource[];
  brands: VehicleBrandResource[];
  models: VehicleModelResource[];
  vehicleTypes: VehicleTypeResource[];
  groups: GroupResource[];
}

export default function Create({ tenants, devices, brands, models, vehicleTypes, groups }: VehicleCreateProps) {
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
            vehicle={{}}
            tenants={tenants}
            devices={devices}
            isCreate={true}
            brands={brands}
            models={models}
            vehicleTypes={vehicleTypes}
            groups={groups}
          />
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 