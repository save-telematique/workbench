import { Head } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import HeadingSmall from '@/components/heading-small';
import DriverForm from "@/components/drivers/driver-form";

interface CreateDriverProps {
  tenants: { id: string; name: string }[];
  users: { id: number; name: string; email: string; tenant_id?: string | null }[];
}

export default function Create({ tenants, users }: CreateDriverProps) {
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

  // Empty driver object for the form
  const emptyDriver = {
    id: '',
    firstname: '',
    surname: '',
    phone: '',
    license_number: '',
    card_issuing_country: '',
    card_number: '',
    birthdate: '',
    card_issuing_date: '',
    card_expiration_date: '',
    tenant_id: tenants.length > 0 ? tenants[0].id : '',
    user_id: null,
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("drivers.create.title")} />

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
            driver={emptyDriver}
            tenants={tenants}
            users={users}
            isCreate={true}
          />
        </div>
      </DriversLayout>
    </AppLayout>
  );
} 