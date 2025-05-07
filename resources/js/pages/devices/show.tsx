import { useState } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, X, Save, Cpu, Building, Truck } from "lucide-react";
import { formatDate } from "@/utils/format";
import AppLayout from '@/layouts/app-layout';
import DevicesLayout from '@/layouts/devices/layout';
import HeadingSmall from '@/components/heading-small';
import { Transition } from '@headlessui/react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { type BreadcrumbItem } from "@/types";

export interface Device {
  id: string;
  imei: string;
  serial_number: string;
  sim_number: string;
  firmware_version?: string;
  device_type_id: number;
  tenant_id?: string;
  vehicle_id?: string;
  created_at: string;
  updated_at: string;
  type: {
    id: number;
    name: string;
    manufacturer: string;
  };
  vehicle?: {
    id: string;
    registration: string;
    tenant_id?: string;
    tenant?: {
      id: string;
      name: string;
    };
  };
  tenant?: {
    id: string;
    name: string;
  };
}

interface DeviceShowProps {
  device: Device;
  deviceTypes: { id: number; name: string; manufacturer: string }[];
}

export default function Show({ device, deviceTypes }: DeviceShowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { __ } = useTranslation();

  const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
    device_type_id: device.device_type_id ? device.device_type_id.toString() : "",
    firmware_version: device.firmware_version || "",
    serial_number: device.serial_number,
    sim_number: device.sim_number,
    imei: device.imei,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.breadcrumbs.show'),
      href: route('devices.show', device.id),
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    patch(route("devices.update", device.id), {
      onSuccess: () => {
        setTimeout(() => {
          setIsEditing(false);
        }, 1000);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("devices.single") + ": " + device.serial_number} />

      <DevicesLayout showSidebar={true} device={device}>
        <div className="space-y-6">
          <HeadingSmall
            title={__("devices.show.heading")}
            description={__("devices.show.description")}
          />

          <div className="flex justify-end space-x-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {__("common.edit")}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={route("devices.index")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {__("devices.actions.back_to_list")}
                  </Link>
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                reset();
              }}>
                <X className="mr-2 h-4 w-4" />
                {__("common.cancel")}
              </Button>
            )}
          </div>

          {isEditing ? (
            // Edit mode
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{__("devices.edit.form_title")}</CardTitle>
                <CardDescription>{__("devices.edit.form_description", { serial: device.serial_number })}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="device_type_id" className="text-sm font-medium">
                        {__("devices.fields.device_type")} <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={data.device_type_id}
                        onValueChange={(value) => setData("device_type_id", value)}
                      >
                        <SelectTrigger id="device_type_id" className="mt-1">
                          <SelectValue placeholder={__("devices.placeholders.device_type")} />
                        </SelectTrigger>
                        <SelectContent>
                          {deviceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.manufacturer} - {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormError message={errors.device_type_id} />
                    </div>

                    <div>
                      <Label htmlFor="serial_number" className="text-sm font-medium">
                        {__("devices.fields.serial_number")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="serial_number"
                        type="text"
                        value={data.serial_number}
                        onChange={(e) => setData("serial_number", e.target.value)}
                        placeholder={__("devices.placeholders.serial_number")}
                        className="mt-1"
                      />
                      <FormError message={errors.serial_number} />
                    </div>

                    <div>
                      <Label htmlFor="sim_number" className="text-sm font-medium">
                        {__("devices.fields.sim_number")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="sim_number"
                        type="text"
                        value={data.sim_number}
                        onChange={(e) => setData("sim_number", e.target.value)}
                        placeholder={__("devices.placeholders.sim_number")}
                        className="mt-1"
                      />
                      <FormError message={errors.sim_number} />
                    </div>

                    <div>
                      <Label htmlFor="imei" className="text-sm font-medium">
                        {__("devices.fields.imei")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="imei"
                        type="text"
                        value={data.imei}
                        onChange={(e) => setData("imei", e.target.value)}
                        placeholder={__("devices.placeholders.imei")}
                        className="mt-1"
                      />
                      <FormError message={errors.imei} />
                    </div>

                    <div>
                      <Label htmlFor="firmware_version" className="text-sm font-medium">
                        {__("devices.fields.firmware_version")}
                      </Label>
                      <Input
                        id="firmware_version"
                        type="text"
                        value={data.firmware_version}
                        onChange={(e) => setData("firmware_version", e.target.value)}
                        placeholder={__("devices.placeholders.firmware_version")}
                        className="mt-1"
                      />
                      <FormError message={errors.firmware_version} />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-6">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}>
                    {__("common.cancel")}
                  </Button>

                  <div className="flex items-center gap-4">
                    <Transition
                      show={recentlySuccessful}
                      enter="transition ease-in-out"
                      enterFrom="opacity-0"
                      leave="transition ease-in-out"
                      leaveTo="opacity-0"
                    >
                      <p className="text-sm text-neutral-600">{__("devices.messages.updated")}</p>
                    </Transition>

                    <Button type="submit" disabled={processing}>
                      <Save className="mr-2 h-4 w-4" />
                      {__("common.save_changes")}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          ) : (
            // View mode - single column layout
            <Card>
              <CardHeader>
                <CardTitle>{__('devices.show.info_section_title')}</CardTitle>
                <CardDescription>{__('devices.show.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.serial_number")}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
                          {device.serial_number}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.device_type")}</TableCell>
                      <TableCell>
                        {device.type ? `${device.type.manufacturer} - ${device.type.name}` : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.imei")}</TableCell>
                      <TableCell>{device.imei}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.sim_number")}</TableCell>
                      <TableCell>{device.sim_number}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.firmware_version")}</TableCell>
                      <TableCell>{device.firmware_version || __("common.none")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.tenant")}</TableCell>
                      <TableCell>
                        {device.tenant ? (
                          <Link 
                            href={route("tenants.show", device.tenant.id)} 
                            className="flex items-center text-primary hover:underline"
                          >
                            <Building className="mr-2 h-4 w-4" />
                            {device.tenant.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{__("common.none")}</span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.vehicle")}</TableCell>
                      <TableCell>
                        {device.vehicle ? (
                          <Link 
                            href={route("vehicles.show", device.vehicle.id)} 
                            className="flex items-center text-primary hover:underline"
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            {device.vehicle.registration}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{__("common.none")}</span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.created_at")}</TableCell>
                      <TableCell>{formatDate(device.created_at)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.updated_at")}</TableCell>
                      <TableCell>{formatDate(device.updated_at)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 