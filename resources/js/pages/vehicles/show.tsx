import { useState } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Building, Cpu, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from "@/components/heading-small";
import { LicensePlate } from "@/components/ui/license-plate";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface DeviceType {
  id: number;
  name: string;
  manufacturer: string;
}

interface Device {
  id: string;
  serial_number: string;
  type?: DeviceType;
}

interface Tenant {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  vin: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string | null;
  device_id?: string | null;
  tenant?: Tenant | null;
  device?: Device | null;
  deleted_at: string | null;
}

interface VehicleShowProps {
  vehicle: Vehicle;
}

export default function Show({ vehicle }: VehicleShowProps) {
  const { __ } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { patch } = useForm();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: __('vehicles.breadcrumbs.show'),
      href: route('vehicles.show', vehicle.id),
    },
  ];

  function handleDelete() {
    patch(route("vehicles.destroy", vehicle.id), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  }

  function handleRestore() {
    if (confirm(__("vehicles.confirmations.restore"))) {
      patch(route("vehicles.restore", vehicle.id));
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.single") + ": " + vehicle.registration} />

      <VehiclesLayout showSidebar={true} vehicleId={vehicle.id}>
        <div className="space-y-6">
          <HeadingSmall
            title={__("vehicles.show.heading")}
            description={__("vehicles.show.description")}
          />

          <div className="flex justify-end space-x-2">
            <Button asChild>
              <Link href={route("vehicles.edit", vehicle.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                {__("common.edit")}
              </Link>
            </Button>
            {!vehicle.deleted_at && (
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {__("vehicles.actions.delete")}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={route("vehicles.index")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {__("vehicles.actions.back_to_list")}
              </Link>
            </Button>
          </div>

          {/* Single column view */}
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
                    <TableCell>
                      <LicensePlate
                        registration={vehicle.registration || ''}
                        size="md"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.brand")}</TableCell>
                    <TableCell>{vehicle.brand || ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.model")}</TableCell>
                    <TableCell>{vehicle.model || ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.vin")}</TableCell>
                    <TableCell>{vehicle.vin || ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.tenant")}</TableCell>
                    <TableCell>
                      {vehicle.tenant ? (
                        <Link 
                          href={route("tenants.show", vehicle.tenant.id)}
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
                          href={route("devices.show", vehicle.device.id)}
                          className="flex items-center hover:underline text-primary"
                        >
                          <Cpu className="mr-2 h-4 w-4" />
                          {vehicle.device.serial_number}
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
                  {vehicle.deleted_at && (
                    <TableRow>
                      <TableCell className="font-medium">{__("common.status")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-destructive border-destructive">
                          {__("common.deleted")}
                        </Badge>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-2 text-primary" 
                          onClick={handleRestore}
                        >
                          {__("vehicles.actions.restore")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

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
                  {__("vehicles.actions.delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 