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
import { 
  VehicleResource, 
  VehicleBrandResource, 
  VehicleModelResource, 
  VehicleTypeResource,
  TenantResource,
  DeviceResource,
  GroupResource 
} from "@/types/resources";
import { VehicleAnalysisData } from "@/types/analysis";
import { SharedData } from "@/types";
import { usePage } from '@inertiajs/react';

// European countries list
const europeanCountries = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" }
];

interface VehicleFormProps {
  vehicle: Partial<VehicleResource>;
  tenants: TenantResource[];
  devices: Pick<DeviceResource, 'id' | 'imei'>[];
  brands: VehicleBrandResource[];
  models: VehicleModelResource[];
  vehicleTypes: VehicleTypeResource[];
  groups: GroupResource[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type
interface VehicleFormData {
  registration: string;
  brand_id?: number | null;
  vehicle_model_id: number | null;
  vehicle_type_id: number | null ;
  vin: string;
  tenant_id: string | null | undefined;
  device_id: string | null | undefined;
  group_id: string | null | undefined;
  country: string;
  [key: string]: string | number | null | undefined;
}

export default function VehicleForm({ 
  vehicle,
  tenants, 
  devices, 
  brands, 
  models,
  vehicleTypes,
  groups,
  isCreate = false,
  onSuccess 
}: VehicleFormProps) {
  const { __ } = useTranslation();
  const [filteredModels, setFilteredModels] = useState<VehicleModelResource[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const { auth } = usePage<SharedData>().props;

  // State for tab navigation
  const [activeTab, setActiveTab] = useState("manual");
  
  // Store brand_id separately for UI filtering
  const [brandId, setBrandId] = useState<number | null>(vehicle.vehicle_model?.vehicle_brand?.id || null);
  
  // Initialize form with default values - use null for empty numeric values
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<VehicleFormData>({
    registration: vehicle.registration || '',
    vehicle_model_id: vehicle.vehicle_model?.id || null,
    vehicle_type_id: vehicle.type?.id || null,
    vin: vehicle.vin || '',
    tenant_id: vehicle.tenant_id || null,
    device_id: vehicle.device_id || null,
    group_id: vehicle.group_id || null,
    country: vehicle.country || '',
  });

  // Function to load models by brand
  const loadModelsByBrand = async (brandId: number) => {
    if (!brandId) {
      setFilteredModels([]);
      return;
    }
    
    setIsLoadingModels(true);
    try {
      const response = await axios.get<VehicleModelResource[]>(route('api.vehicle-brands.models', { id: brandId }));
      setFilteredModels(response.data);
    } catch (error) {
      console.error('Error while loading models:', error);
      setFilteredModels([]);
    } finally {
      setIsLoadingModels(false);
      setInitialLoadDone(true);
    }
  };

  // Initial load for models matching the selected brand
  useEffect(() => {
    if (!initialLoadDone && brandId) {
      loadModelsByBrand(brandId);
    } else if (!initialLoadDone) {
      // Filter models matching the brand from initial data
      const modelId = vehicle.vehicle_model?.id;
      if (modelId) {
        const model = models.find(m => m.id === modelId);
        if (model?.vehicle_brand?.id) {
          setBrandId(model.vehicle_brand.id);
        }
      }
      
      // Filter models based on brandId (if any)
      const filtered = models.filter(model => 
        model.vehicle_brand?.id === brandId
      );
      setFilteredModels(filtered);
      setInitialLoadDone(true);
    }
  }, [vehicle, models, initialLoadDone, brandId]);

  // Update models when brand changes
  useEffect(() => {
    if (initialLoadDone && brandId) {
      loadModelsByBrand(brandId);
    }
  }, [brandId, initialLoadDone]);

  // Handle analysis completion
  const handleAnalysisComplete = (analysisData: VehicleAnalysisData) => {
    // Create a properly typed updatedData object
    const updatedData = {
      ...data,
      registration: analysisData.registration || data.registration,
      vin: analysisData.vin || data.vin,
      country: analysisData.country || data.country,
    };

    // If we got brand_id and model_id from the backend, use them
    if (analysisData.brand_id) {
      setBrandId(analysisData.brand_id);
      
      // If we have a model_id, set it
      if (analysisData.model_id) {
        updatedData.vehicle_model_id = analysisData.model_id;
      }
    }

    if (analysisData.vehicle_type) {
      updatedData.vehicle_type_id = analysisData.vehicle_type;
    }

    setData(updatedData);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Use Inertia's form submission which automatically handles CSRF tokens
    if (isCreate) {
      submit('post', route("vehicles.store"));
    } else if (vehicle.id) {
      submit('put', route("vehicles.update", { vehicle: vehicle.id }));
    }
    
    // Handle success callback if needed
    if (onSuccess) {
      onSuccess();
    }
  }

  function handleBrandChange(value: string) {
    // Parse string to number or null
    const newBrandId = value ? parseInt(value, 10) : null;
    
    // Update the brandId state for UI filtering
    setBrandId(newBrandId);
    
    // Reset vehicle model when brand changes
    setData(prev => ({
      ...prev,
      vehicle_model_id: null,
    }));
  }

  function handleModelChange(value: string) {
    // Parse string to number or null
    const modelId = value ? parseInt(value, 10) : null;
    
    setData(prev => ({
      ...prev,
      vehicle_model_id: modelId,
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

  function handleCountryChange(value: string) {
    setData(prev => ({
      ...prev,
      country: value,
    }));
  }

  const renderFormFields = () => (
    <CardContent className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="registration" className="text-sm font-medium">
            {__("vehicles.fields.registration")}
            <span className="text-destructive"> *</span>
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
            value={brandId?.toString() || ''}
            onValueChange={handleBrandChange}
          >
            <SelectTrigger id="brand_id" className="mt-1">
              <SelectValue placeholder={__("vehicles.placeholders.brand")} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={`brand-${brand.id}`} value={brand.id.toString()}>
                  {brand.name}
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
              {vehicleTypes.map((type) => (
                <SelectItem key={`vehicle_type-${type.id}`} value={type.id.toString()}>
                  {type.name}
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
          <Label htmlFor="vehicle_model_id" className="text-sm font-medium">
            {__("vehicles.fields.model")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.vehicle_model_id?.toString() || ''}
            onValueChange={handleModelChange}
            disabled={!brandId || isLoadingModels}
          >
            <SelectTrigger id="vehicle_model_id" className="mt-1">
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
                filteredModels.map((model) => (
                  <SelectItem key={`model-${model.id}`} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormError message={errors.vehicle_model_id} />
        </div>

        <div>
          <Label htmlFor="country" className="text-sm font-medium">
            {__("vehicles.fields.country")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.country}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger id="country" className="mt-1">
              <SelectValue placeholder={__("vehicles.placeholders.country")} />
            </SelectTrigger>
            <SelectContent>
              {europeanCountries.map((country) => (
                <SelectItem key={`country-${country.code}`} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormError message={errors.country} />
        </div>
      </div>

      {!auth.user?.tenant_id && (
        <>
          <Separator className="my-6" />

          <div className="grid gap-6 md:grid-cols-2 pb-4">
        <div className="space-y-2">
          <Label htmlFor="tenant_id" className="text-sm font-medium">
            {__("vehicles.fields.tenant")} 
            <span className="text-destructive"> *</span>
          </Label>
          <Select
            value={data.tenant_id ?? ''}
            onValueChange={(value) => setData("tenant_id", value === 'none' ? null : value)}
          >
            <SelectTrigger id="tenant_id" className="mt-1">
              <SelectValue placeholder={__("vehicles.placeholders.tenant")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{__("common.none")}</SelectItem>
              {tenants.map((tenant) => (
                <SelectItem key={`tenant-${tenant.id}`} value={tenant.id}>
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
            value={data.device_id ?? ''}
            onValueChange={(value) => setData("device_id", value === 'none' ? null : value)}
          >
            <SelectTrigger id="device_id" className="mt-1">
              <SelectValue placeholder={__("vehicles.placeholders.device")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{__("common.none")}</SelectItem>
              {devices.map((device) => (
                <SelectItem key={`device-${device.id}`} value={device.id}>
                  {device.imei}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                    <FormError message={errors.device_id} />
        </div>
      </div>
        </>
      )}

      {/* Group selection */}
      <div className="space-y-2">
        <Label htmlFor="group_id" className="text-sm font-medium">
          {__("vehicles.fields.group")}
        </Label>
        <Select
          value={data.group_id ?? ''}
          onValueChange={(value) => setData("group_id", value === 'none' ? null : value)}
        >
          <SelectTrigger id="group_id" className="mt-1">
            <SelectValue placeholder={__("vehicles.placeholders.group")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{__("common.none")}</SelectItem>
            {groups.map((group) => (
              <SelectItem key={`group-${group.id}`} value={group.id}>
                {group.full_path}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError message={errors.group_id} />
      </div>
    </CardContent>
  );

  const renderFooter = () => (
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
            {__('common.saved')}
          </p>
        </Transition>
        
        <Button type="submit" disabled={processing}>
          <Save className="mr-2 h-4 w-4" />
          {isCreate ? __("vehicles.create.submit_button") : __("common.save")}
        </Button>
      </div>
    </CardFooter>
  );

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