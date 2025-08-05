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
import { Save } from "lucide-react";
import { Transition } from '@headlessui/react';
import { Separator } from "@/components/ui/separator";
import { DeviceTypeResource, TenantResource, VehicleResource, DeviceResource } from "@/types";
import { useForm } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalysisUpload from "@/components/image-analysis-upload";
import { AnalysisData } from "@/types/analysis";
import { useState, useMemo } from "react";

interface DeviceFormProps {
  device: Partial<DeviceResource>;
  deviceTypes: DeviceTypeResource[];
  tenants: TenantResource[];
  vehicles: Pick<VehicleResource, 'id' | 'registration' | 'tenant_id'>[];
  isCreate?: boolean;
  onSuccess?: () => void;
}



export default function DeviceForm({
  device,
  deviceTypes,
  tenants,
  vehicles,
  isCreate = false,
  onSuccess
}: DeviceFormProps) {
  const { __ } = useTranslation();
  const [activeTab, setActiveTab] = useState("manual");

  // Initialize form with device data or defaults
  const { data, setData, processing, errors, recentlySuccessful, post, put } = useForm({
    device_type_id: device.type?.id.toString() || "",
    tenant_id: device.tenant_id || '',
    vehicle_id: device.vehicle_id || '',
    firmware_version: device.firmware_version || "",
    serial_number: device.serial_number || "",
    sim_number: device.sim_number || "",
    imei: device.imei || "",
  });

  // Filter vehicles based on selected tenant
  const filteredVehicles = useMemo(() => {
    if (!data.tenant_id) {
      return vehicles;
    }
    return vehicles.filter(vehicle => vehicle.tenant_id === data.tenant_id);
  }, [vehicles, data.tenant_id]);

  // Handle vehicle selection and auto-set tenant
  const handleVehicleChange = (vehicleId: string) => {
    setData(prevData => {
      const selectedVehicle = vehicles.find(v => v.id === vehicleId);
      return {
        ...prevData,
        vehicle_id: vehicleId,
        tenant_id: selectedVehicle?.tenant_id || prevData.tenant_id
      };
    });
  };

  // Handle tenant selection and clear vehicle if it doesn't belong to the tenant
  const handleTenantChange = (tenantId: string) => {
    setData(prevData => {
      const vehicleBelongsToTenant = vehicles.find(v => 
        v.id === prevData.vehicle_id && v.tenant_id === tenantId
      );
      
      return {
        ...prevData,
        tenant_id: tenantId,
        vehicle_id: vehicleBelongsToTenant ? prevData.vehicle_id : ''
      };
    });
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isCreate) {
      post(route("devices.store"));
    } else if (device.id) {
      put(route("devices.update", { device: device.id }));
    }
    
    // Handle success callback if needed
    if (onSuccess) {
      onSuccess();
    }
  }

  // Handle analysis completion
  const handleAnalysisComplete = (analysisData: AnalysisData) => {
    // Create a properly typed updatedData object
    const updatedData = {
      ...data,
      serial_number: analysisData.serial_number?.toString() || data.serial_number,
      imei: analysisData.imei?.toString() || data.imei,
      firmware_version: analysisData.firmware_version?.toString() || data.firmware_version,
    };

    // If we got device_type_id from the backend, use it
    if ('device_type_id' in analysisData && analysisData.device_type_id) {
      updatedData.device_type_id = analysisData.device_type_id.toString();
    } else if ('device_type' in analysisData && analysisData.device_type) {
      // Try to find the device type by name
      const matchingType = deviceTypes.find(type => 
        type.name.toLowerCase().includes((analysisData.device_type as string).toLowerCase())
      );
      if (matchingType) {
        updatedData.device_type_id = matchingType.id.toString();
      }
    }

    setData(updatedData);
  };

  const renderFormFields = () => (
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
              {__("devices.fields.sim_number")}
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
            onValueChange={handleTenantChange}
          >
            <SelectTrigger id="tenant_id" className="mt-1">
              <SelectValue placeholder={__("devices.placeholders.tenant")} />
            </SelectTrigger>
            <SelectContent>
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
            onValueChange={handleVehicleChange}
          >
            <SelectTrigger id="vehicle_id" className="mt-1">
              <SelectValue placeholder={__("devices.placeholders.vehicle")} />
            </SelectTrigger>
            <SelectContent>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  {data.tenant_id 
                    ? __("devices.placeholders.no_vehicles_for_tenant")
                    : __("devices.placeholders.select_tenant_first")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormError message={errors.vehicle_id} />
        </div>
      </div>
    </CardContent>
  );

  const renderFooter = () => (
    <CardFooter className="flex justify-between border-t px-6 py-4">
      <Button 
        type="button" 
        variant="outline"
        onClick={() => window.history.back()}
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
          <p className="text-sm text-green-500 dark:text-green-400">
            {__("common.saved")}
          </p>
        </Transition>
        <Button type="submit" disabled={processing}>
          <Save className="mr-2 h-4 w-4" />
          {isCreate ? __("devices.create.submit_button") : __("common.save")}
        </Button>
      </div>
    </CardFooter>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreate ? __("devices.create.card.title") : __("devices.edit.card.title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("devices.create.card.description")
              : __("devices.edit.card.description", { serial: device.serial_number || '' })}
          </CardDescription>
        </CardHeader>

        {isCreate ? (
          <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="manual">{__("devices.input_methods.manual")}</TabsTrigger>
                <TabsTrigger value="scan">{__("devices.input_methods.scan")}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="scan" className="mt-4 px-6">
              <ImageAnalysisUpload
                analysisType="device"
                onAnalysisComplete={handleAnalysisComplete}
                onChangeTab={setActiveTab}
                apiEndpoint={route('devices.scan-qr-code')}
              />
            </TabsContent>
            
            <TabsContent value="manual">
              {renderFormFields()}
              {renderFooter()}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {renderFormFields()}
            {renderFooter()}
          </>
        )}
      </Card>
    </form>
  );
} 