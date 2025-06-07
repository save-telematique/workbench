import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, TenantResource, UserResource, GroupResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import HeadingSmall from '@/components/heading-small';
import DriverForm from "@/components/drivers/driver-form";

interface CreateDriverProps {
  tenants: TenantResource[];
  users: UserResource[];
  groups: GroupResource[];
}

export default function Create({ tenants, users, groups }: CreateDriverProps) {
  const { __ } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('drivers.breadcrumbs.index'),
      href: route('drivers.index'),
    },
    {
      title: __('drivers.breadcrumbs.create'),
      href: route('drivers.create'),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("drivers.actions.create")} />

      <DriversLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("drivers.create.heading")} 
            description={__("drivers.create.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("drivers.index")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_list")}
            </a>
          </Button>
        </div>

        <div className="mt-6">
          <DriverForm 
            driver={{}}
            tenants={tenants}
            users={users}
            groups={groups}
            isCreate={true}
          />
        </div>
      </DriversLayout>
    </AppLayout>
  );
} 