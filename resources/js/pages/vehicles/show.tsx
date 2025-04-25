import { Head, Link, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PenSquare, Trash2, Car, ArrowTopRightOnSquare } from "lucide-react";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  color: string;
  vin: string;
  year: number;
  created_at: string;
  updated_at: string;
  tenant?: {
    id: string;
    name: string;
  };
  device?: {
    id: string;
    serial_number: string;
    type: {
      id: number;
      name: string;
      manufacturer: string;
    };
  };
  deleted_at: string | null;
}

interface VehicleShowProps {
  vehicle: Vehicle;
}

export default function Show({ vehicle }: VehicleShowProps) {
  const { __ } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    router.delete(route("vehicles.destroy", vehicle.id), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  }

  function handleRestore() {
    if (confirm(__("vehicles.confirmations.restore"))) {
      router.put(route("vehicles.restore", vehicle.id));
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.show.title", { registration: vehicle.registration })} />

      <VehiclesLayout>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeadingSmall 
              title={__("vehicles.show.heading")} 
              description={__("vehicles.show.description")} 
            />
            <LicensePlate
              registration={vehicle.registration}
              size="lg"
            />
            {vehicle.deleted_at && (
              <Badge variant="outline" className="text-destructive border-destructive ml-2">
                {__("common.deleted")}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Button variant="outline" asChild>
              <a href={route("vehicles.index")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {__("common.back_to_list")}
              </a>
            </Button>
            
            {!vehicle.deleted_at && (
              <>
                <Button variant="outline" asChild>
                  <Link href={route("vehicles.edit", vehicle.id)}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    {__("vehicles.actions.edit")}
                  </Link>
                </Button>
                
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {__("vehicles.actions.delete")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{__("vehicles.confirmations.delete_title")}</DialogTitle>
                      <DialogDescription>
                        {__("vehicles.confirmations.delete_description")}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        {__("common.cancel")}
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        {__("vehicles.actions.delete")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            
            {vehicle.deleted_at && (
              <Button variant="outline" onClick={handleRestore}>
                {__("vehicles.actions.restore")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
                        registration={vehicle.registration}
                        size="md"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.brand")}</TableCell>
                    <TableCell>{vehicle.brand}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.model")}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.color")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: vehicle.color }}
                        ></div>
                        {vehicle.color}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.year")}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.vin")}</TableCell>
                    <TableCell>{vehicle.vin}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{__("vehicles.show.sections.associations.title")}</CardTitle>
              <CardDescription>{__("vehicles.show.sections.associations.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{__("vehicles.fields.tenant")}</TableCell>
                    <TableCell>
                      {vehicle.tenant ? (
                        <Link 
                          href={route("tenants.show", vehicle.tenant.id)}
                          className="flex items-center hover:underline text-primary"
                        >
                          {vehicle.tenant.name}
                          <ArrowTopRightOnSquare className="ml-1 h-3 w-3" />
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
                        <div>
                          <Link 
                            href={route("devices.show", vehicle.device.id)}
                            className="flex items-center hover:underline text-primary"
                          >
                            {vehicle.device.serial_number}
                            <ArrowTopRightOnSquare className="ml-1 h-3 w-3" />
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vehicle.device.type.manufacturer} - {vehicle.device.type.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">{__("common.none")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{__("vehicles.show.sections.metadata.title")}</CardTitle>
              <CardDescription>{__("vehicles.show.sections.metadata.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{__("common.created_at")}</TableCell>
                    <TableCell>{new Date(vehicle.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("common.updated_at")}</TableCell>
                    <TableCell>{new Date(vehicle.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                  {vehicle.deleted_at && (
                    <TableRow>
                      <TableCell className="font-medium">{__("common.deleted_at")}</TableCell>
                      <TableCell>{new Date(vehicle.deleted_at).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 