import { Head, Link } from "@inertiajs/react";
import { type BreadcrumbItem, GroupResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, FolderTree, Car, UserCheck, Users, Trash2 } from "lucide-react";
import GroupsLayout from "@/layouts/groups/layout";
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/utils/permissions';
import { router } from '@inertiajs/react';

interface GroupShowProps {
  group: GroupResource;
}

export default function Show({ group }: GroupShowProps) {
  const { __ } = useTranslation();
  const canEditGroups = usePermission('edit_groups');
  const canDeleteGroups = usePermission('delete_groups');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('groups.breadcrumbs.index'),
      href: route('groups.index'),
    },
    {
      title: group.name,
      href: route('groups.show', { group: group.id }),
    },
  ];

  const handleDelete = () => {
    if (confirm(__('groups.delete.confirm', { name: group.name }))) {
      router.delete(route('groups.destroy', { group: group.id }));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={group.name} />

      <GroupsLayout showSidebar={true} group={group}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: group.color || '#6366f1' }}
              >
                <FolderTree className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{group.name}</h1>
                {group.full_path && group.full_path !== group.name && (
                  <p className="text-muted-foreground text-sm">{group.full_path}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {canEditGroups && (
                <Button asChild>
                  <Link href={route('groups.edit', { group: group.id })}>
                    <Edit className="mr-2 h-4 w-4" />
                    {__('groups.actions.edit')}
                  </Link>
                </Button>
              )}
              
              {canDeleteGroups && group.can_delete && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {__('groups.actions.delete')}
                </Button>
              )}
            </div>
          </div>

          {/* Group Information */}
          <Card>
            <CardHeader>
              <CardTitle>{__('groups.show.information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {__('groups.fields.name')}
                  </label>
                  <p className="text-sm">{group.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {__('groups.fields.status')}
                  </label>
                  <div className="mt-1">
                    <Badge variant={group.is_active ? "default" : "secondary"}>
                      {group.is_active ? __('common.active') : __('common.inactive')}
                    </Badge>
                  </div>
                </div>

                {group.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {__('groups.fields.description')}
                    </label>
                    <p className="text-sm">{group.description}</p>
                  </div>
                )}

                {group.parent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {__('groups.fields.parent_group')}
                    </label>
                    <div className="mt-1">
                      <Button variant="link" asChild className="h-auto p-0 text-left">
                        <Link href={route('groups.show', { group: group.parent.id })}>
                          {group.parent.name}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {group.tenant && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {__('groups.fields.tenant')}
                    </label>
                    <div className="mt-1">
                      <Button variant="link" asChild className="h-auto p-0 text-left">
                        <Link href={route('tenants.show', { tenant: group.tenant.id })}>
                          {group.tenant.name}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Child Groups */}
          {group.children && group.children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  {__('groups.show.child_groups')} ({group.children.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div 
                        className="flex h-8 w-8 items-center justify-center rounded text-white text-xs"
                        style={{ backgroundColor: child.color || '#6366f1' }}
                      >
                        <FolderTree className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Button variant="link" asChild className="h-auto p-0 text-left font-medium">
                          <Link href={route('groups.show', { group: child.id })}>
                            {child.name}
                          </Link>
                        </Button>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={child.is_active ? "default" : "secondary"} className="text-xs">
                            {child.is_active ? __('common.active') : __('common.inactive')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicles */}
          {group.vehicles && group.vehicles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {__('groups.show.vehicles')} ({group.vehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Car className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <Button variant="link" asChild className="h-auto p-0 text-left font-medium">
                          <Link href={route('vehicles.show', { vehicle: vehicle.id })}>
                            {vehicle.registration}
                          </Link>
                        </Button>
                        {vehicle.vehicle_model && (
                          <p className="text-xs text-muted-foreground truncate">
                            {vehicle.vehicle_model.vehicle_brand?.name} {vehicle.vehicle_model.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Drivers */}
          {group.drivers && group.drivers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  {__('groups.show.drivers')} ({group.drivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.drivers.map((driver) => (
                    <div key={driver.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <Button variant="link" asChild className="h-auto p-0 text-left font-medium">
                          <Link href={route('drivers.show', { driver: driver.id })}>
                            {driver.firstname} {driver.surname}
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground truncate">
                          {driver.license_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users */}
          {group.users && group.users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {__('groups.show.users')} ({group.users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </GroupsLayout>
    </AppLayout>
  );
} 