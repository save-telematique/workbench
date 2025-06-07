import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, TenantResource, GroupResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GroupsLayout from "@/layouts/groups/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import GroupForm from "@/components/groups/group-form";

interface GroupEditProps {
  group: GroupResource;
  tenants: TenantResource[];
  parentGroups: GroupResource[];
}

export default function Edit({ group, tenants, parentGroups }: GroupEditProps) {
  const { __ } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('groups.breadcrumbs.index'),
      href: route('groups.index'),
    },
    {
      title: group.name,
      href: route('groups.show', { group: group.id }),
    },
    {
      title: __('groups.breadcrumbs.edit'),
      href: route('groups.edit', { group: group.id }),
    },
  ];
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("groups.actions.edit")} />

      <GroupsLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("groups.edit.heading")} 
            description={__("groups.edit.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("groups.show", { group: group.id })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_group")}
            </a>
          </Button>
        </div>

        <div className="mt-6">
          <GroupForm
            group={group}
            tenants={tenants}
            parentGroups={parentGroups}
            isCreate={false}
          />
        </div>
      </GroupsLayout>
    </AppLayout>
  );
} 