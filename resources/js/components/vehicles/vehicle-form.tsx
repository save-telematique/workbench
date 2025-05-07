import { useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalysisUpload from "@/components/image-analysis-upload";
import axios from "axios";

// Define the AnalysisData type locally since it can't be imported from the component
type AnalysisData = {
  registration?: string | number;
  vin?: string | number;
  brand?: string;
  model?: string;
  brand_id?: number;
  model_id?: number;
  first_registration_date?: string;
  serial_number?: string | number;
  imei?: string | number;
  firmware_version?: string | number;
  device_type?: string;
  device_type_id?: number;
  [key: string]: string | number | undefined;
};

interface VehicleModel {
  id: number;
  name: string;
  brand_id: number;
  brand_name?: string;
}

interface Vehicle {
  id: string; // UUID
  registration: string;
  brand?: string;
  model?: string;
  vin: string;
  model_id?: number;
  brand_id?: number;
  vehicle_type_id?: number;
  tenant_id: string | null; // UUID
  device_id: string | null; // UUID
}

interface VehicleFormProps {
  vehicle: Vehicle;
  tenants: { id: string; name: string }[]; // UUID
  devices: { id: string; serial_number: string }[]; // UUID
  brands: { id: number; name: string }[];
  models: VehicleModel[];
  vehicleTypes: { id: number; name: string }[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type with index signature to satisfy FormDataType
interface VehicleFormData {
  registration: string;
  brand_id: number | null;
  model_id: number | null;
  vehicle_type_id: number | null;
  vin: string;
  tenant_id: string;
  device_id: string;
  [key: string]: string | number | null | undefined;
}

export default function VehicleForm({ 
  vehicle,
  tenants, 
  devices, 
  brands, 
  models,
  vehicleTypes,
  isCreate = false,
  onSuccess 
}: VehicleFormProps) {
  const { __ } = useTranslation();
  const [filteredModels, setFilteredModels] = useState<VehicleModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // State for tab navigation
  const [activeTab, setActiveTab] = useState("manual");
  
  // Initialize form with default values - use null for empty numeric values
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<VehicleFormData>({
    registration: vehicle.registration || '',
    brand_id: vehicle.brand_id || null,
    model_id: vehicle.model_id || null,
    vehicle_type_id: vehicle.vehicle_type_id || null,
    vin: vehicle.vin || '',
    tenant_id: 'none',
    device_id: 'none',
  });

  // Initialisation des champs device_id et tenant_id après le montage du composant
  useEffect(() => {
    if (vehicle.tenant_id) {
      setData('tenant_id', vehicle.tenant_id);
    }
    
    if (vehicle.device_id) {
      setData('device_id', vehicle.device_id);
    }
  }, [vehicle]);

  // Fonction pour charger les modèles en fonction de la marque
  const loadModelsByBrand = async (brandId: number) => {
    if (!brandId) {
      setFilteredModels([]);
      return;
    }
    
    setIsLoadingModels(true);
    try {
      const response = await axios.get(route('global-settings.vehicle-brands.models', brandId));
      setFilteredModels(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
      setFilteredModels([]);
    } finally {
      setIsLoadingModels(false);
      setInitialLoadDone(true);
    }
  };

  // Initialisation initiale pour charger les modèles correspondant à la marque déjà sélectionnée
  useEffect(() => {
    if (!initialLoadDone && vehicle.brand_id) {
      loadModelsByBrand(vehicle.brand_id);
    } else if (!initialLoadDone) {
      // Filtrer les modèles correspondant à la marque sélectionnée depuis les données initiales
      const filtered = models.filter(model => 
        model.brand_id === vehicle.brand_id
      );
      setFilteredModels(filtered);
      setInitialLoadDone(true);
    }
  }, [vehicle, models, initialLoadDone]);

  // Mise à jour des modèles lorsque la marque change
  useEffect(() => {
    if (initialLoadDone && data.brand_id) {
      loadModelsByBrand(data.brand_id);
    }
  }, [data.brand_id, initialLoadDone]);

  // Handle analysis completion
  const handleAnalysisComplete = (analysisData: AnalysisData) => {
    // Create a properly typed updatedData object
    const updatedData = {
      ...data,
      registration: analysisData.registration?.toString() || data.registration,
      vin: analysisData.vin?.toString() || data.vin,
    };

    // If we got brand_id and model_id from the backend, use them
    if ('brand_id' in analysisData && analysisData.brand_id) {
      updatedData.brand_id = analysisData.brand_id;  // Keep as number
      
      // If we have a model_id, set it
      if ('model_id' in analysisData && analysisData.model_id) {
        updatedData.model_id = analysisData.model_id;  // Keep as number
      }
    }

    setData(updatedData);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Use Inertia's form submission which automatically handles CSRF tokens
    if (isCreate) {
      submit('post', route("vehicles.store"));
    } else if (vehicle.id) {
      submit('put', route("vehicles.update", vehicle.id));
    }
    
    // Handle success callback if needed
    if (onSuccess) {
      onSuccess();
    }
  }

  function handleBrandChange(value: string) {
    // Parse string to number or null
    const brandId = value ? parseInt(value, 10) : null;
    
    setData(prev => ({
      ...prev,
      brand_id: brandId,
      model_id: null, // Reset model when brand changes
    }));
  }

  function handleModelChange(value: string) {
    // Parse string to number or null
    const modelId = value ? parseInt(value, 10) : null;
    
    setData(prev => ({
      ...prev,
      model_id: modelId,
    }));
  }

  function handleVehicleTypeChange(value: string) {
    // Parse string to number or null
    const typeId = value ? parseInt(value, 10) : null;
    
    setData(prev => ({
      ...prev,
      vehicle_type_id: typeId,
    }));
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreate ? __("vehicles.create.card.title") : __("vehicles.edit.form_title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("vehicles.create.card.description")
              : __("vehicles.edit.form_description", { registration: vehicle.registration || '' })}
          </CardDescription>
        </CardHeader>
        
        {isCreate ? (
          <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="manual">{__("vehicles.input_methods.manual")}</TabsTrigger>
                <TabsTrigger value="scan">{__("vehicles.input_methods.scan")}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="scan" className="mt-4 px-6">
              <ImageAnalysisUpload
                analysisType="vehicle"
                onAnalysisComplete={handleAnalysisComplete}
                onChangeTab={setActiveTab}
                apiEndpoint={route('vehicles.scan-registration')}
              />
            </TabsContent>
            
            <TabsContent value="manual">
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="registration" className="text-sm font-medium">
                      {__("vehicles.fields.registration")}
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
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="brand_id" className="text-sm font-medium">
                      {__("vehicles.fields.brand")} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={data.brand_id?.toString() || ''}
                      onValueChange={handleBrandChange}
                    >
                      <SelectTrigger id="brand_id" className="mt-1">
                        <SelectValue placeholder={__("vehicles.placeholders.brand")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(brands) && brands.map((brand) => (
                          <SelectItem key={`brand-${brand.id}`} value={brand.id.toString()}>
                            {brand.name || ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormError message={errors.brand_id} />
                  </div>

                  <div>
                    <Label htmlFor="vehicle_type_id" className="text-sm font-medium">
                      {__("vehicles.fields.vehicle_type")} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={data.vehicle_type_id?.toString() || ''}
                      onValueChange={handleVehicleTypeChange}
                    >
                      <SelectTrigger id="vehicle_type_id" className="mt-1">
                        <SelectValue placeholder={__("vehicles.placeholders.vehicle_type")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(vehicleTypes) && vehicleTypes.map((type) => (
                          <SelectItem key={`vehicle_type-${type.id}`} value={type.id.toString()}>
                            {type.name || ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormError message={errors.vehicle_type_id} />
                  </div>
                </div>

                {/* Model section */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="model_id" className="text-sm font-medium">
                      {__("vehicles.fields.model")} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={data.model_id?.toString() || ''}
                      onValueChange={handleModelChange}
                      disabled={!data.brand_id || isLoadingModels}
                    >
                      <SelectTrigger id="model_id" className="mt-1">
                        <SelectValue placeholder={
                          isLoadingModels 
                            ? __("vehicles.loading_models") 
                            : __("vehicles.placeholders.model")
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingModels ? (
                          <SelectItem value="loading" disabled>
                            {__("vehicles.loading_models")}
                          </SelectItem>
                        ) : (
                          Array.isArray(filteredModels) && filteredModels.map((model) => (
                            <SelectItem key={`model-${model.id}`} value={model.id.toString()}>
                              {model.name || ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormError message={errors.model_id} />
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
                        {Array.isArray(tenants) && tenants.map((tenant) => (
                          <SelectItem key={`tenant-${tenant.id}`} value={tenant.id}>
                            {tenant.name || ''}
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
                        {Array.isArray(devices) && devices.map((device) => (
                          <SelectItem key={`device-${device.id}`} value={device.id}>
                            {device.serial_number || ''}
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
                    <p className="text-sm text-neutral-600">
                      {__('vehicles.create.success_message')}
                    </p>
                  </Transition>
                  
                  <Button type="submit" disabled={processing}>
                    <Save className="mr-2 h-4 w-4" />
                    {__("vehicles.create.submit_button")}
                  </Button>
                </div>
              </CardFooter>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
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
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="brand_id" className="text-sm font-medium">
                    {__("vehicles.fields.brand")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.brand_id?.toString() || ''}
                    onValueChange={handleBrandChange}
                  >
                    <SelectTrigger id="brand_id" className="mt-1">
                      <SelectValue placeholder={__("vehicles.placeholders.brand")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(brands) && brands.map((brand) => (
                        <SelectItem key={`brand-${brand.id}`} value={brand.id.toString()}>
                          {brand.name || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.brand_id} />
                </div>

                <div>
                  <Label htmlFor="vehicle_type_id" className="text-sm font-medium">
                    {__("vehicles.fields.vehicle_type")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.vehicle_type_id?.toString() || ''}
                    onValueChange={handleVehicleTypeChange}
                  >
                    <SelectTrigger id="vehicle_type_id" className="mt-1">
                      <SelectValue placeholder={__("vehicles.placeholders.vehicle_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(vehicleTypes) && vehicleTypes.map((type) => (
                        <SelectItem key={`vehicle_type-${type.id}`} value={type.id.toString()}>
                          {type.name || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.vehicle_type_id} />
                </div>
              </div>

              {/* Model section */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="model_id" className="text-sm font-medium">
                    {__("vehicles.fields.model")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.model_id?.toString() || ''}
                    onValueChange={handleModelChange}
                    disabled={!data.brand_id || isLoadingModels}
                  >
                    <SelectTrigger id="model_id" className="mt-1">
                      <SelectValue placeholder={
                        isLoadingModels 
                          ? __("vehicles.loading_models") 
                          : __("vehicles.placeholders.model")
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingModels ? (
                        <SelectItem value="loading" disabled>
                          {__("vehicles.loading_models")}
                        </SelectItem>
                      ) : (
                        Array.isArray(filteredModels) && filteredModels.map((model) => (
                          <SelectItem key={`model-${model.id}`} value={model.id.toString()}>
                            {model.name || ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.model_id} />
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
                      {Array.isArray(tenants) && tenants.map((tenant) => (
                        <SelectItem key={`tenant-${tenant.id}`} value={tenant.id}>
                          {tenant.name || ''}
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
                      {Array.isArray(devices) && devices.map((device) => (
                        <SelectItem key={`device-${device.id}`} value={device.id}>
                          {device.serial_number || ''}
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
                onClick={() => window.history.back()}
              >
                {__("common.cancel")}
              </Button>
              
              <Button type="submit" disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                {__("common.save")}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
      
      <Transition
        show={recentlySuccessful}
        enter="transition ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in-out duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <p className="text-sm text-green-600 mt-2">{__("common.saved")}</p>
      </Transition>
    </form>
  );
} 