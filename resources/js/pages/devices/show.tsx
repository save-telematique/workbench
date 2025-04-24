import { useState } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, X, Save, Link as LinkIcon, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Device {
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
  };
  tenant?: {
    id: string;
    name: string;
  };
}

interface DeviceShowProps {
  device: Device;
  deviceTypes: { id: number; name: string; manufacturer: string }[];
  tenants: { id: string; name: string }[];
  vehicles: { id: string; registration: string }[];
}

export default function Show({ device, deviceTypes, tenants, vehicles }: DeviceShowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { __ } = useTranslation();

  const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
    device_type_id: device.device_type_id.toString(),
    tenant_id: device.tenant_id || "none",
    vehicle_id: device.vehicle_id || "none",
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

      <DevicesLayout showSidebar={true} deviceId={device.id}>
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
                    <ArrowLeft className="mr-2 h-4 w-4" />
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
                    <div className="space-y-4">
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
                    </div>

                    <div className="space-y-4">
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
                  </div>

                  <Separator className="my-6" />

                  <div className="grid gap-6 md:grid-cols-2 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenant_id" className="text-sm font-medium">
                        {__("devices.fields.tenant")}
                      </Label>
                      <Select
                        value={data.tenant_id}
                        onValueChange={(value) => setData("tenant_id", value)}
                      >
                        <SelectTrigger id="tenant_id" className="mt-1">
                          <SelectValue placeholder={__("devices.placeholders.tenant")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{__("common.none")}</SelectItem>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormError message={errors.tenant_id} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle_id" className="text-sm font-medium">
                        {__("devices.fields.vehicle")}
                      </Label>
                      <Select
                        value={data.vehicle_id}
                        onValueChange={(value) => setData("vehicle_id", value)}
                      >
                        <SelectTrigger id="vehicle_id" className="mt-1">
                          <SelectValue placeholder={__("devices.placeholders.vehicle")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{__("common.none")}</SelectItem>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.registration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormError message={errors.vehicle_id} />
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
            // View mode
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                      {__('devices.show.info_section_title')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Cpu className="mr-3 h-5 w-5 text-neutral-500 mt-0.5" />
                        <div>
                          <span className="block font-medium text-base">{device.serial_number}</span>
                          <span className="text-sm text-neutral-500">
                            {device.type?.manufacturer} - {device.type?.name}
                          </span>
                        </div>
                      </div>

                      <div className="ml-8 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">{__("devices.fields.imei")}</p>
                          <p>{device.imei}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-500">{__("devices.fields.sim_number")}</p>
                          <p>{device.sim_number}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-500">{__("devices.fields.firmware_version")}</p>
                          <p>{device.firmware_version || __("common.none")}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-500">{__("devices.fields.created_at")}</p>
                          <p>{formatDate(device.created_at)}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-500">{__("devices.fields.updated_at")}</p>
                          <p>{formatDate(device.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                      {__('devices.show.connections_title')}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-neutral-500 mb-2">{__("devices.fields.tenant")}</p>
                        {device.tenant ? (
                          <div className="flex items-center">
                            <Link href={route("tenants.show", device.tenant.id)} className="flex items-center gap-1 text-blue-600 hover:text-blue-900">
                              {device.tenant.name}
                              <LinkIcon className="h-3 w-3" />
                            </Link>
                          </div>
                        ) : (
                          <Badge variant="outline" className="mt-1">{__("common.none")}</Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-neutral-500 mb-2">{__("devices.fields.vehicle")}</p>
                        {device.vehicle ? (
                          <div className="flex items-center">
                            <Link 
                            //href={route("vehicles.show", device.vehicle.id)} 
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-900">
                              {device.vehicle.registration}
                              <LinkIcon className="h-3 w-3" />
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2 h-7"
                              asChild
                            >
                              <Link href={route("devices.unassign-vehicle", device.id)}>
                                {__("devices.actions.unassign_vehicle_short")}
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="outline" className="mb-3">{__("common.none")}</Badge>
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <Link href={route("devices.assign-vehicle", device.id)}>
                                  {__("devices.actions.assign_vehicle")}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 