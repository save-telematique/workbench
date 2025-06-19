import { useState } from 'react';
import { type BreadcrumbItem, VehicleResource } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Building, Cpu, Trash2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import FormattedDate from "@/components/formatted-date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermission } from "@/utils/permissions";
import VehicleTrackingMap from "@/components/maps/vehicle-tracking-map";
import EntityAlerts from "@/components/alerts/entity-alerts";

interface VehicleShowProps {
  vehicle: VehicleResource;
}

export default function Show({ vehicle }: VehicleShowProps) {
  const { __ } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canEditVehicles = usePermission('edit_vehicles');
  const canDeleteVehicles = usePermission('delete_vehicles');

  const { patch } = useForm();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: vehicle.registration || __('vehicles.breadcrumbs.show'),
      href: route('vehicles.show', { vehicle: vehicle.id }),
    },
  ];

  function handleDelete() {
    patch(route("vehicles.destroy", { vehicle: vehicle.id }), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  }

  function handleRestore() {
    patch(route("vehicles.restore", { vehicle: vehicle.id }));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.single") + ": " + vehicle.registration} />

      <VehiclesLayout showSidebar={true} vehicle={vehicle}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {vehicle.registration} {vehicle.vehicle_model && vehicle.vehicle_model.vehicle_brand ? `${vehicle.vehicle_model.vehicle_brand.name} - ${vehicle.vehicle_model.name}` : ''}
            </h2>
            {vehicle.deleted_at && (
              <Badge variant="outline" className="mt-2">
                {__("common.deleted")}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {!vehicle.deleted_at && canEditVehicles && (
              <Button asChild variant="outline">
                <Link href={route("vehicles.edit", { vehicle: vehicle.id })}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {__("common.edit")}
                </Link>
              </Button>
            )}
            {!vehicle.deleted_at && canDeleteVehicles && (
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {__("common.delete")}
              </Button>
            )}
            {vehicle.deleted_at && canDeleteVehicles && (
              <Button variant="outline" onClick={handleRestore}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {__("common.restore")}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{__("vehicles.show.sections.details.title")}</CardTitle>
            <CardDescription>{__("vehicles.show.sections.details.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.registration")}</TableCell>
                  <TableCell>{vehicle.registration || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.brand")}</TableCell>
                  <TableCell>{vehicle.vehicle_model && vehicle.vehicle_model.vehicle_brand ? vehicle.vehicle_model.vehicle_brand.name : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.model")}</TableCell>
                  <TableCell>{vehicle.vehicle_model && vehicle.vehicle_model.name ? vehicle.vehicle_model.name : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.vin")}</TableCell>
                  <TableCell>{vehicle.vin || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("common.created_at")}</TableCell>
                  <TableCell>
                    {vehicle.created_at ? (
                      <FormattedDate date={vehicle.created_at} format="DATE_MED" />
                    ) : '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("common.updated_at")}</TableCell>
                  <TableCell>
                    {vehicle.updated_at ? (
                      <FormattedDate date={vehicle.updated_at} format="DATE_MED" />
                    ) : '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.tenant")}</TableCell>
                  <TableCell>
                    {vehicle.tenant ? (
                      <Link 
                        href={route("tenants.show", { tenant: vehicle.tenant.id })}
                        className="flex items-center hover:underline text-primary"
                      >
                        <Building className="mr-2 h-4 w-4" />
                        {vehicle.tenant.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{__("common.none")}</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.device")}</TableCell>
                  <TableCell>
                    {vehicle.device ? (
                      <Link 
                        href={route("devices.show", { device: vehicle.device.id })}
                        className="flex items-center hover:underline text-primary"
                      >
                        <Cpu className="mr-2 h-4 w-4" />
                        {vehicle.device.imei}
                        {vehicle.device.type && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({vehicle.device.type.manufacturer} - {vehicle.device.type.name})
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{__("common.none")}</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add the Vehicle Tracking Map component */}
        <div className="mt-6">
          <VehicleTrackingMap 
            vehicle={vehicle} 
            title={__("vehicles.show.sections.tracking.title")}
            historyModeDefault={false}
            showDatePicker={true}
            initialDate={new Date()}
          />
        </div>

        {/* Alerts Section */}
        <div className="mt-6">
          <EntityAlerts
            entityType="vehicle"
            entityId={vehicle.id}
            entityName={vehicle.registration}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{__("vehicles.confirmations.delete_title")}</DialogTitle>
              <DialogDescription>
                {__("vehicles.confirmations.delete_description")}
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
      </VehiclesLayout>
    </AppLayout>
  );
} 