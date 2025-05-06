import { useState } from 'react';
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
      title: vehicle.registration || __('vehicles.breadcrumbs.show'),
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
    patch(route("vehicles.restore", vehicle.id));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.single") + ": " + vehicle.registration} />

      <VehiclesLayout showSidebar={true} vehicleId={vehicle.id}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {vehicle.registration} {vehicle.brand && vehicle.model ? `- ${vehicle.brand} ${vehicle.model}` : ''}
            </h2>
            {vehicle.deleted_at && (
              <Badge variant="outline" className="mt-2">
                {__("common.deleted")}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {!vehicle.deleted_at && (
              <Button asChild variant="outline">
                <Link href={route("vehicles.edit", vehicle.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {__("common.edit")}
                </Link>
              </Button>
            )}
            {!vehicle.deleted_at && (
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {__("common.delete")}
              </Button>
            )}
            {vehicle.deleted_at && (
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
                  <TableCell>{vehicle.brand || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("vehicles.fields.model")}</TableCell>
                  <TableCell>{vehicle.model || '-'}</TableCell>
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
                {__("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </VehiclesLayout>
    </AppLayout>
  );
} 