import { Head, useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ArrowLeft, Save } from "lucide-react";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Transition } from '@headlessui/react';
import { Separator } from "@/components/ui/separator";

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
  tenant_id: string | null;
  device_id: string | null;
}

interface VehicleEditProps {
  vehicle: Vehicle;
  tenants: { id: string; name: string }[];
  devices: { id: string; serial_number: string }[];
  brands: string[];
}

export default function Edit({ vehicle, tenants, devices, brands }: VehicleEditProps) {
  const { __ } = useTranslation();
  const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
    registration: vehicle.registration,
    brand: vehicle.brand,
    model: vehicle.model,
    color: vehicle.color,
    vin: vehicle.vin,
    year: vehicle.year,
    tenant_id: vehicle.tenant_id || "none",
    device_id: vehicle.device_id || "none",
  });

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: __('vehicles.breadcrumbs.edit'),
      href: route('vehicles.edit', vehicle.id),
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(route("vehicles.update", vehicle.id));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("vehicles.actions.edit")} />

      <VehiclesLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("vehicles.edit.heading")} 
            description={__("vehicles.edit.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("vehicles.show", vehicle.id)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back")}
            </a>
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader className="pb-4">
            <CardTitle>{__("vehicles.edit.card.title")}</CardTitle>
            <CardDescription>{__("vehicles.edit.card.description")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="registration" className="text-sm font-medium">
                      {__("vehicles.fields.registration")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="registration"
                      type="text"
                      value={data.registration}
                      onChange={(e) => setData("registration", e.target.value)}
                      placeholder={__("vehicles.placeholders.registration")}
                      className="mt-1"
                    />
                    <FormError message={errors.registration} />
                  </div>

                  <div>
                    <Label htmlFor="brand" className="text-sm font-medium">
                      {__("vehicles.fields.brand")} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={data.brand}
                      onValueChange={(value) => setData("brand", value)}
                    >
                      <SelectTrigger id="brand" className="mt-1">
                        <SelectValue placeholder={__("vehicles.placeholders.brand")} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormError message={errors.brand} />
                  </div>

                  <div>
                    <Label htmlFor="model" className="text-sm font-medium">
                      {__("vehicles.fields.model")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="model"
                      type="text"
                      value={data.model}
                      onChange={(e) => setData("model", e.target.value)}
                      placeholder={__("vehicles.placeholders.model")}
                      className="mt-1"
                    />
                    <FormError message={errors.model} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="color" className="text-sm font-medium">
                      {__("vehicles.fields.color")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="color"
                      type="text"
                      value={data.color}
                      onChange={(e) => setData("color", e.target.value)}
                      placeholder={__("vehicles.placeholders.color")}
                      className="mt-1"
                    />
                    <FormError message={errors.color} />
                  </div>

                  <div>
                    <Label htmlFor="vin" className="text-sm font-medium">
                      {__("vehicles.fields.vin")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="vin"
                      type="text"
                      value={data.vin}
                      onChange={(e) => setData("vin", e.target.value)}
                      placeholder={__("vehicles.placeholders.vin")}
                      className="mt-1"
                    />
                    <FormError message={errors.vin} />
                  </div>

                  <div>
                    <Label htmlFor="year" className="text-sm font-medium">
                      {__("vehicles.fields.year")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={data.year}
                      onChange={(e) => setData("year", Number(e.target.value))}
                      placeholder={__("vehicles.placeholders.year")}
                      className="mt-1"
                    />
                    <FormError message={errors.year} />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-6 md:grid-cols-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant_id" className="text-sm font-medium">
                    {__("vehicles.fields.tenant")}
                  </Label>
                  <Select
                    value={data.tenant_id}
                    onValueChange={(value) => setData("tenant_id", value)}
                  >
                    <SelectTrigger id="tenant_id" className="mt-1">
                      <SelectValue placeholder={__("vehicles.placeholders.tenant")} />
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
                  <Label htmlFor="device_id" className="text-sm font-medium">
                    {__("vehicles.fields.device")}
                  </Label>
                  <Select
                    value={data.device_id}
                    onValueChange={(value) => setData("device_id", value)}
                  >
                    <SelectTrigger id="device_id" className="mt-1">
                      <SelectValue placeholder={__("vehicles.placeholders.device")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{__("common.none")}</SelectItem>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.serial_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.device_id} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => window.location.href = route('vehicles.show', vehicle.id)}
              >
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
                  <p className="text-sm text-neutral-600">
                    {__('vehicles.edit.success_message')}
                  </p>
                </Transition>
                
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  {__("vehicles.edit.submit_button")}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </VehiclesLayout>
    </AppLayout>
  );
} 