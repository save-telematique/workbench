import { Head, Link, useForm } from "@inertiajs/react";
import { type BreadcrumbItem, GeofenceResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import AppLayout from '@/layouts/app-layout';
import GeofencesLayout from "@/layouts/geofences/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Building, FolderTree, Trash2, RotateCcw } from "lucide-react";
import FormattedDate from "@/components/formatted-date";
import { usePermission, useTenantUser } from "@/utils/permissions";
import GeofenceDrawingMap from "@/components/maps/geofence-drawing-map";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface GeofenceShowProps {
  geofence: GeofenceResource;
}

export default function Show({ geofence }: GeofenceShowProps) {
  const { __ } = useTranslation();
  const isTenantUser = useTenantUser();
  const canEditGeofences = usePermission('edit_geofences');
  const canDeleteGeofences = usePermission('delete_geofences');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { patch } = useForm();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('geofences.breadcrumbs.index'),
      href: route('geofences.index'),
    },
    {
      title: geofence.name,
      href: route('geofences.show', { geofence: geofence.id }),
    },
  ];

  function handleDelete() {
    patch(route("geofences.destroy", { geofence: geofence.id }), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  }

  function handleRestore() {
    patch(route("geofences.restore", { geofence: geofence.id }));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${__('geofences.title')} - ${geofence.name}`} />

      <GeofencesLayout geofence={geofence}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{geofence.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={geofence.is_active ? "default" : "secondary"}>
                    {geofence.is_active ? __('geofences.status.active') : __('geofences.status.inactive')}
                  </Badge>
                  {geofence.deleted_at && (
                    <Badge variant="outline" className="text-destructive border-destructive">
                      {__("common.deleted")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!geofence.deleted_at && canEditGeofences && (
                <Button asChild variant="outline">
                  <Link href={route("geofences.edit", { geofence: geofence.id })}>
                    <Edit className="mr-2 h-4 w-4" />
                    {__("common.edit")}
                  </Link>
                </Button>
              )}
              {!geofence.deleted_at && canDeleteGeofences && (
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {__("common.delete")}
                </Button>
              )}
              {geofence.deleted_at && canDeleteGeofences && (
                <Button variant="outline" onClick={handleRestore}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {__("common.restore")}
                </Button>
              )}
            </div>
          </div>

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>{__('geofences.show.information')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{__("geofences.fields.name")}</TableCell>
                    <TableCell>{geofence.name}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">{__("geofences.fields.status")}</TableCell>
                    <TableCell>
                      <Badge variant={geofence.is_active ? "default" : "secondary"}>
                        {geofence.is_active ? __('geofences.status.active') : __('geofences.status.inactive')}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {geofence.group && (
                    <TableRow>
                      <TableCell className="font-medium">{__("geofences.fields.group")}</TableCell>
                      <TableCell className="flex items-center">
                        <FolderTree className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Link 
                          href={route("groups.show", { group: geofence.group.id })}
                          className="text-primary hover:underline"
                        >
                          {geofence.group.name}
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isTenantUser && geofence.tenant && (
                    <TableRow>
                      <TableCell className="font-medium">{__("geofences.fields.tenant")}</TableCell>
                      <TableCell className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Link 
                          href={route("tenants.show", { tenant: geofence.tenant.id })}
                          className="text-primary hover:underline"
                        >
                          {geofence.tenant.name}
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell className="font-medium">{__("common.created_at")}</TableCell>
                    <TableCell>
                      {geofence.created_at ? (
                        <FormattedDate date={geofence.created_at} format="DATE_MED" />
                      ) : '-'}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">{__("common.updated_at")}</TableCell>
                    <TableCell>
                      {geofence.updated_at ? (
                        <FormattedDate date={geofence.updated_at} format="DATE_MED" />
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Map Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {__('geofences.show.map')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {geofence.geojson ? (
                <GeofenceDrawingMap
                  height="400px"
                  initialGeojson={null}
                  onGeofenceChange={() => {}} // Read-only mode
                  showExistingGeofences={true}
                  existingGeofences={[{
                    id: geofence.id,
                    name: geofence.name,
                    geojson: geofence.geojson as GeoJSON.Geometry,
                    is_active: geofence.is_active
                  }]}
                  readonly={true}
                  className="pointer-events-none [&_.mapboxgl-ctrl-group]:hidden [&_.absolute.top-4]:hidden"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
                  <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">{__("geofences.map.no_data")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {__("geofences.form.map_description")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{__("geofences.confirmations.delete_title")}</DialogTitle>
              <DialogDescription>
                {__("geofences.confirmations.delete_description")}
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                {__("common.cancel")}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                {__("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </GeofencesLayout>
    </AppLayout>
  );
} 