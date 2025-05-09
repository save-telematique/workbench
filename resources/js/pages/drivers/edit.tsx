import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, DriverResource, TenantResource, UserResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import HeadingSmall from '@/components/heading-small';
import DriverForm from "@/components/drivers/driver-form";

interface EditDriverProps {
  driver: DriverResource;
  tenants: TenantResource[];
  users: UserResource[];
}

export default function Edit({ driver, tenants, users }: EditDriverProps) {
  const { __ } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('drivers.breadcrumbs.index'),
      href: route('drivers.index'),
    },
    {
      title: `${driver.firstname} ${driver.surname}`,
      href: route('drivers.show', { driver: driver.id }),
    },
    {
      title: __('drivers.breadcrumbs.edit'),
      href: route('drivers.edit', { driver: driver.id }),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("drivers.actions.edit")} />

      <DriversLayout showSidebar={true} driverId={driver.id}>
        <div className="space-y-6">
          <HeadingSmall 
            title={__("drivers.edit.heading", { name: `${driver.firstname} ${driver.surname}` })}
            description={__("drivers.edit.description")}
          />

          <DriverForm
            driver={driver}
            tenants={tenants}
            users={users}
          />
        </div>
      </DriversLayout>
    </AppLayout>
  );
} 