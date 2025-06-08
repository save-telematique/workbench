import { useState } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, X, Save, Cpu, Building, Truck } from "lucide-react";
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
import { type BreadcrumbItem, DeviceResource, DeviceTypeResource } from "@/types";
import FormattedDate from '@/components/formatted-date';
import EntityAlerts from "@/components/alerts/entity-alerts";

// Extend DeviceResource to include fields needed for the show page
interface ExtendedDeviceResource extends DeviceResource {
  device_type_id: number;
  deleted_at?: string | null;
  last_contact_at: string | null;
}

interface DeviceShowProps {
  device: ExtendedDeviceResource;
  deviceTypes: DeviceTypeResource[];
}

export default function Show({ device, deviceTypes }: DeviceShowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { __ } = useTranslation();

  const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
    device_type_id: device.type?.id.toString() || "",
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
      href: route('devices.show', { device: device.id }),
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    patch(route("devices.update", { device: device.id }), {
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
                      {__("common.save")}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" /> {device.serial_number}
                </CardTitle>
                <CardDescription>
                  {device.type ? `${device.type.manufacturer} - ${device.type.name}` : __("common.unknown")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">{__("devices.fields.imei")}</TableCell>
                      <TableCell>{device.imei}</TableCell>
                    </TableRow>
                    {device.sim_number && (
                      <TableRow>
                        <TableCell className="font-medium">{__("devices.fields.sim_number")}</TableCell>
                        <TableCell>{device.sim_number}</TableCell>
                      </TableRow>
                    )}
                    {device.firmware_version && (
                      <TableRow>
                        <TableCell className="font-medium">{__("devices.fields.firmware_version")}</TableCell>
                        <TableCell>{device.firmware_version}</TableCell>
                      </TableRow>
                    )}
                    {device.last_contact_at && (
                      <TableRow>
                        <TableCell className="font-medium">{__("devices.fields.last_contact")}</TableCell>
                        <TableCell>
                          {device.last_contact_at ? <FormattedDate date={device.last_contact_at} format="DATETIME_FULL" /> : '-'}
                        </TableCell>
                      </TableRow>
                    )}
                    {device.tenant && (
                      <TableRow>
                        <TableCell className="font-medium">{__("devices.fields.tenant")}</TableCell>
                        <TableCell className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Link 
                            href={route("tenants.show", { tenant: device.tenant.id })}
                            className="text-primary hover:underline"
                          >
                            {device.tenant.name}
                          </Link>
                        </TableCell>
                      </TableRow>
                    )}
                    {device.vehicle && (
                      <TableRow>
                        <TableCell className="font-medium">{__("devices.fields.vehicle")}</TableCell>
                        <TableCell className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Link 
                            href={route("vehicles.show", { vehicle: device.vehicle.id })}
                            className="text-primary hover:underline"
                          >
                            {device.vehicle.registration}
                          </Link>
                          {device.vehicle.tenant && device.vehicle.tenant.id !== device.tenant_id && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({__("devices.different_tenant")})
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="font-medium">{__("common.created_at")}</TableCell>
                      <TableCell>
                        {device.created_at ? <FormattedDate date={device.created_at} format="DATE_MED" /> : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{__("common.updated_at")}</TableCell>
                      <TableCell>
                        {device.updated_at ? <FormattedDate date={device.updated_at} format="DATE_MED" /> : '-'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Alerts Section */}
          {!isEditing && (
            <EntityAlerts
              entityType="device"
              entityId={device.id}
              entityName={device.serial_number}
            />
          )}
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 