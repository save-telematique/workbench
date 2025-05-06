import { useState, useEffect } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Building, Cpu, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from "@/components/heading-small";
import { LicensePlate } from "@/components/ui/license-plate";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
  tenants: Tenant[];
  devices: Device[];
}

export default function Show({ vehicle, tenants, devices }: VehicleShowProps) {
  const { __ } = useTranslation();
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [tenantSearchQuery, setTenantSearchQuery] = useState("");
  const [deviceSearchQuery, setDeviceSearchQuery] = useState("");
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>(tenants || []);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(devices || []);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, setData, patch } = useForm({
    tenant_id: vehicle.tenant_id || 'none',
    device_id: vehicle.device_id || 'none',
  });

  // Filter tenants based on search query
  useEffect(() => {
    if (!tenants || !Array.isArray(tenants)) {
      setFilteredTenants([]);
      return;
    }
    
    if (tenantSearchQuery.trim() === "") {
      setFilteredTenants(tenants);
    } else {
      const lowerQuery = tenantSearchQuery.toLowerCase();
      setFilteredTenants(
        tenants.filter(tenant => 
          tenant.name && tenant.name.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [tenantSearchQuery, tenants]);

  // Filter devices based on search query
  useEffect(() => {
    if (!devices || !Array.isArray(devices)) {
      setFilteredDevices([]);
      return;
    }
    
    if (deviceSearchQuery.trim() === "") {
      setFilteredDevices(devices);
    } else {
      const lowerQuery = deviceSearchQuery.toLowerCase();
      setFilteredDevices(
        devices.filter(device => 
          device.serial_number && device.serial_number.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [deviceSearchQuery, devices]);

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

  function assignDevice(deviceId: string) {
    const updatedData = { ...data, device_id: deviceId };
    setData(updatedData);
    patch(route("vehicles.update", vehicle.id), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setDeviceDialogOpen(false);
      }
    });
  }

  function assignTenant(tenantId: string) {
    const updatedData = { ...data, tenant_id: tenantId };
    setData(updatedData);
    patch(route("vehicles.update", vehicle.id), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setTenantDialogOpen(false);
      }
    });
  }

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

          {/* View mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <div className="flex justify-between items-center">
                            <Link 
                              href={route("tenants.show", vehicle.tenant.id)}
                              className="flex items-center hover:underline text-primary"
                            >
                              <Building className="mr-2 h-4 w-4" />
                              {vehicle.tenant.name}
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setTenantDialogOpen(true)}
                            >
                              {__("vehicles.actions.change_tenant")}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">{__("common.none")}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setTenantDialogOpen(true)}
                            >
                              {__("vehicles.actions.assign_tenant")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("vehicles.fields.device")}</TableCell>
                      <TableCell>
                        {vehicle.device ? (
                          <div className="flex justify-between items-center">
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setDeviceDialogOpen(true)}
                            >
                              {__("vehicles.actions.change_device")}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">{__("common.none")}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setDeviceDialogOpen(true)}
                            >
                              {__("vehicles.actions.assign_device")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Tenant Assignment Dialog */}
          <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{__("vehicles.dialogs.tenant_assignment.title")}</DialogTitle>
                <DialogDescription>
                  {__("vehicles.dialogs.tenant_assignment.description")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative mb-4">
                <Input 
                  placeholder={__("vehicles.dialogs.tenant_assignment.search_placeholder")} 
                  value={tenantSearchQuery}
                  onChange={(e) => setTenantSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{__("vehicles.fields.tenant_name")}</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        {__("common.none")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => assignTenant("none")}
                        >
                          {__("common.select")}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {filteredTenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => assignTenant(tenant.id)}
                          >
                            {__("common.select")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setTenantDialogOpen(false)}
                >
                  {__("common.cancel")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Device Assignment Dialog */}
          <Dialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{__("vehicles.dialogs.device_assignment.title")}</DialogTitle>
                <DialogDescription>
                  {__("vehicles.dialogs.device_assignment.description")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative mb-4">
                <Input 
                  placeholder={__("vehicles.dialogs.device_assignment.search_placeholder")} 
                  value={deviceSearchQuery}
                  onChange={(e) => setDeviceSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{__("vehicles.fields.device_serial")}</TableHead>
                      <TableHead>{__("vehicles.fields.device_type")}</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        {__("common.none")}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => assignDevice("none")}
                        >
                          {__("common.select")}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.serial_number}</TableCell>
                        <TableCell>
                          {device.type ? `${device.type.manufacturer} - ${device.type.name}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => assignDevice(device.id)}
                          >
                            {__("common.select")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setDeviceDialogOpen(false)}
                >
                  {__("common.cancel")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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