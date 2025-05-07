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
import { ArrowLeft, Save, Upload, Camera } from "lucide-react";
import DevicesLayout from "@/layouts/devices/layout";
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Transition } from '@headlessui/react';
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';
import { type BreadcrumbItem } from "@/types";

interface DeviceCreateProps {
  deviceTypes: { id: number; name: string; manufacturer: string }[];
  tenants: { id: string; name: string }[];
  vehicles: { id: string; registration: string }[];
}

export default function Create({ deviceTypes, tenants, vehicles }: DeviceCreateProps) {
  const { __ } = useTranslation();
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    device_type_id: "",
    tenant_id: "none",
    vehicle_id: "none",
    firmware_version: "",
    serial_number: "",
    sim_number: "",
    imei: "",
  });

  const [activeTab, setActiveTab] = useState("manual");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.breadcrumbs.create'),
      href: route('devices.create'),
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route("devices.store"));
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider le type et la taille de l'image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB en octets

    if (!validImageTypes.includes(file.type)) {
      setScanResult({
        success: false,
        message: __('devices.scan.error_invalid_format')
      });
      return;
    }

    if (file.size > maxFileSize) {
      setScanResult({
        success: false,
        message: __('devices.scan.error_file_too_large')
      });
      return;
    }

    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.onerror = () => {
      setScanResult({
        success: false,
        message: __('devices.scan.error_reading_file')
      });
    };
    reader.readAsDataURL(file);

    // Start scanning process
    setScanning(true);
    setScanResult(null);

    // Create form data to send the image
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Utiliser une URL absolue et Axios pour éviter les problèmes CSRF 
      // L'URL absolue évite les problèmes de routage
      const response = await axios.post('/devices/scan-qr-code', formData, {
        headers: {
          'Accept': 'application/json',
        }
      });

      setScanning(false);
      const result = response.data;

      if (result.success && result.data) {
        // Update form with extracted data
        const deviceData = result.data;
        let deviceTypeId = data.device_type_id;
        
        if (deviceData.device_type) {
          // Try to find a matching device type by name
          const matchedType = deviceTypes.find(type => {
            const deviceTypeStr = deviceData.device_type?.toLowerCase() || '';
            const typeName = type.name.toLowerCase();
            const typeManufacturer = type.manufacturer.toLowerCase();
            
            return (
              deviceTypeStr.includes(typeName) || 
              typeName.includes(deviceTypeStr) ||
              deviceTypeStr.includes(typeManufacturer) ||
              typeManufacturer.includes(deviceTypeStr)
            );
          });
          
          if (matchedType) {
            deviceTypeId = matchedType.id.toString();
          }
        }
        
        setData({
          ...data,
          serial_number: deviceData.serial_number || data.serial_number,
          imei: deviceData.imei || data.imei,
          firmware_version: deviceData.firmware_version || data.firmware_version,
          device_type_id: deviceTypeId,
        });

        // Afficher un message de succès
        setScanResult({
          success: true,
          message: __('devices.scan.success')
        });
        
        // Basculer automatiquement vers l'onglet manuel après un scan réussi
        setTimeout(() => setActiveTab("manual"), 500);
      } else {
        // Afficher un message d'erreur
        setScanResult({
          success: false,
          message: result.error || __('devices.scan.error')
        });
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      
      // Déterminer le message d'erreur à afficher
      let errorMessage = __('devices.scan.error');
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      setScanResult({
        success: false,
        message: errorMessage
      });
      setScanning(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("devices.actions.create")} />

      <DevicesLayout showSidebar={false}>
        <div className="flex items-center justify-between">
          <HeadingSmall 
            title={__("devices.create.heading")} 
            description={__("devices.create.description")} 
          />
          <Button variant="outline" asChild>
            <a href={route("devices.index")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {__("common.back_to_list")}
            </a>
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{__("devices.create.card.title")}</CardTitle>
            <CardDescription>{__("devices.create.card.description")}</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="manual">{__("devices.input_methods.manual")}</TabsTrigger>
                <TabsTrigger value="scan">{__("devices.input_methods.scan")}</TabsTrigger>
              </TabsList>
            </div>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="scan" className="mt-4 px-6">
                <div className="mb-6">
                  <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
                    {imagePreview ? (
                      <div className="relative w-full max-w-md">
                        <img 
                          src={imagePreview} 
                          alt="Device QR Code" 
                          className="w-full h-auto rounded-md object-contain max-h-[300px]" 
                        />
                        <Button 
                          type="button" 
                          onClick={triggerFileInput} 
                          variant="secondary" 
                          className="mt-2 w-full"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          {__("devices.scan.change_image")}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center text-center">
                          <Upload className="h-10 w-10 text-neutral-400 mb-2" />
                          <h3 className="text-lg font-medium">{__("devices.scan.upload_title")}</h3>
                          <p className="text-sm text-neutral-500 max-w-xs">
                            {__("devices.scan.upload_description")}
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          onClick={triggerFileInput} 
                          variant="secondary"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {__("devices.scan.select_image")}
                        </Button>
                      </>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {scanning && (
                    <div className="mt-4 p-4 bg-neutral-50 border rounded-md text-center">
                      <div className="flex justify-center mb-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                      </div>
                      <p className="text-neutral-700">{__("devices.scan.scanning")}</p>
                      <p className="text-xs text-neutral-500 mt-1">{__("devices.scan.scanning_hint")}</p>
                    </div>
                  )}
                  
                  {scanResult && (
                    <Alert 
                      variant={scanResult.success ? 'success' : 'destructive'}
                      className="mt-4"
                    >
                      <AlertDescription>
                        {scanResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="manual">
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
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => window.location.href = route('devices.index')}
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
                        {__('devices.create.success_message')}
                      </p>
                    </Transition>
                    
                    <Button type="submit" disabled={processing}>
                      <Save className="mr-2 h-4 w-4" />
                      {__("devices.create.submit_button")}
                    </Button>
                  </div>
                </CardFooter>
              </TabsContent>
            </form>
          </Tabs>
        </Card>
      </DevicesLayout>
    </AppLayout>
  );
} 