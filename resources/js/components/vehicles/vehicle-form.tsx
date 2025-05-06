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
import axios from "axios";

interface VehicleModel {
  id: string;
  name: string;
  brand_id: string;
  brand_name?: string;
}

interface Vehicle {
  id: string;
  registration: string;
  brand?: string;
  model?: string;
  vin: string;
  model_id?: string;
  brand_id?: string;
  tenant_id: string | null;
  device_id: string | null;
}

interface VehicleFormProps {
  vehicle: Vehicle;
  tenants: { id: string; name: string }[];
  devices: { id: string; serial_number: string }[];
  brands: { id: string; name: string }[];
  models: VehicleModel[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

export default function VehicleForm({ 
  vehicle,
  tenants, 
  devices, 
  brands, 
  models,
  isCreate = false,
  onSuccess 
}: VehicleFormProps) {
  const { __ } = useTranslation();
  const [filteredModels, setFilteredModels] = useState<VehicleModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const formMethod = isCreate ? 'post' : 'put';
  const formAction = isCreate 
    ? route("vehicles.store") 
    : route("vehicles.update", vehicle.id);
  
  // Initialisation du formulaire avec les valeurs par défaut
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm({
    registration: vehicle.registration || '',
    brand_id: vehicle.brand_id || '',
    model_id: vehicle.model_id || '',
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
  const loadModelsByBrand = async (brandId: string) => {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(formMethod, formAction, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  }

  function handleBrandChange(brandId: string) {
    setData("brand_id", brandId);
    setData("model_id", ""); // Reset model when brand changes
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>
            {isCreate ? __("vehicles.create.card.title") : __("vehicles.edit.form_title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("vehicles.create.card.description")
              : __("vehicles.edit.form_description", { registration: vehicle.registration || '' })}
          </CardDescription>
        </CardHeader>
        
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
                <Label htmlFor="brand_id" className="text-sm font-medium">
                  {__("vehicles.fields.brand")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.brand_id}
                  onValueChange={handleBrandChange}
                >
                  <SelectTrigger id="brand_id" className="mt-1">
                    <SelectValue placeholder={__("vehicles.placeholders.brand")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(brands) && brands.map((brand) => (
                      <SelectItem key={`brand-${brand.id}`} value={brand.id}>
                        {brand.name || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError message={errors.brand_id} />
              </div>

              <div>
                <Label htmlFor="model_id" className="text-sm font-medium">
                  {__("vehicles.fields.model")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.model_id}
                  onValueChange={(value) => setData("model_id", value)}
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
                        <SelectItem key={`model-${model.id}`} value={model.id}>
                          {model.name || ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormError message={errors.model_id} />
              </div>
            </div>

            <div className="space-y-4">
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
          <Button type="submit" disabled={processing} className="ml-auto">
            <Save className="h-4 w-4 mr-2" />
            {isCreate ? __("common.create") : __("common.save")}
          </Button>
        </CardFooter>
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