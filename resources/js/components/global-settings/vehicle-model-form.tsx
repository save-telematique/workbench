import { useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { Save } from "lucide-react";
import { Transition } from '@headlessui/react';
import { VehicleBrandResource, VehicleModelResource } from "@/types/resources";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleModelFormProps {
  model: Partial<VehicleModelResource>;
  brands: VehicleBrandResource[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type
interface VehicleModelFormData {
  name: string;
  vehicle_brand_id: string;
  [key: string]: string | undefined;
}

export default function VehicleModelForm({ 
  model,
  brands,
  isCreate = false,
  onSuccess 
}: VehicleModelFormProps) {
  const { __ } = useTranslation();

  // Initialize form with default values
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<VehicleModelFormData>({
    name: model.name || '',
    vehicle_brand_id: model.brand?.id?.toString() || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Use Inertia's form submission which automatically handles CSRF tokens
    if (isCreate) {
      submit('post', route("global-settings.vehicle-models.store"), {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        }
      });
    } else if (model.id) {
      submit('put', route("global-settings.vehicle-models.update", { vehicle_model: model.id }), {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        }
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreate ? __("global_settings.vehicle_models.create.title") : __("global_settings.vehicle_models.edit.title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("global_settings.vehicle_models.create.description")
              : __("global_settings.vehicle_models.edit.description", { name: model.name || '' })}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              {__("common.name")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder={__("global_settings.vehicle_models.placeholders.name")}
              className="mt-1"
              required
            />
            <FormError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="vehicle_brand_id" className="text-sm font-medium">
              {__("common.brand")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.vehicle_brand_id}
              onValueChange={(value) => setData("vehicle_brand_id", value)}
            >
              <SelectTrigger id="vehicle_brand_id" className="mt-1">
                <SelectValue placeholder={__("global_settings.vehicle_models.placeholders.brand")} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={`brand-${brand.id}`} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={errors.vehicle_brand_id} />
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
                {__('common.saved')}
              </p>
            </Transition>
            
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              {isCreate ? __("common.create") : __("common.save")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
} 