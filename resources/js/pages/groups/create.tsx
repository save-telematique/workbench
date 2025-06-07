import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, TenantResource, GroupResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GroupsLayout from "@/layouts/groups/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import GroupForm from "@/components/groups/group-form";

interface GroupCreateProps {
  tenants: TenantResource[];
  parentGroups: GroupResource[];
}

export default function Create({ tenants, parentGroups }: GroupCreateProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('groups.breadcrumbs.index'),
      href: route('groups.index'),
    },
    {
      title: __('groups.breadcrumbs.create'),
      href: route('groups.create'),
    },
  ];
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("groups.actions.create")} />

      <GroupsLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("groups.create.heading")} 
            description={__("groups.create.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("groups.index")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_list")}
            </a>
          </Button>
        </div>

        <div className="mt-6">
          <GroupForm
            group={{}}
            tenants={tenants}
            parentGroups={parentGroups}
            isCreate={true}
          />
        </div>
      </GroupsLayout>
    </AppLayout>
  );
} 