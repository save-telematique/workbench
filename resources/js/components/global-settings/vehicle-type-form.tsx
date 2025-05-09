import { useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { Save } from "lucide-react";
import { Transition } from '@headlessui/react';
import { VehicleTypeResource } from "@/types/resources";

interface VehicleTypeFormProps {
  type: Partial<VehicleTypeResource>;
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type
interface VehicleTypeFormData {
  name: string;
  [key: string]: string | undefined;
}

export default function VehicleTypeForm({ 
  type,
  isCreate = false,
  onSuccess 
}: VehicleTypeFormProps) {
  const { __ } = useTranslation();

  // Initialize form with default values
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<VehicleTypeFormData>({
    name: type.name || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Use Inertia's form submission which automatically handles CSRF tokens
    if (isCreate) {
      submit('post', route("global-settings.vehicle-types.store"), {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        }
      });
    } else if (type.id) {
      submit('put', route("global-settings.vehicle-types.update", { vehicle_type: type.id }), {
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
            {isCreate ? __("global_settings.vehicle_types.create.title") : __("global_settings.vehicle_types.edit.title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("global_settings.vehicle_types.create.description")
              : __("global_settings.vehicle_types.edit.description", { name: type.name || '' })}
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
              placeholder={__("global_settings.vehicle_types.placeholders.name")}
              className="mt-1"
              required
            />
            <FormError message={errors.name} />
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