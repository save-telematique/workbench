import { useForm } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { useState } from "react";
import { Save } from "lucide-react";
import { Transition } from '@headlessui/react';
import { VehicleBrandResource } from "@/types/resources";

// Extended type for the form that includes logo_url
interface VehicleBrandWithLogo extends Partial<VehicleBrandResource> {
  logo_url?: string | null;
}

interface VehicleBrandFormProps {
  brand: VehicleBrandWithLogo;
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type
interface VehicleBrandFormData {
  name: string;
  logo?: File | null;
  [key: string]: string | File | null | undefined;
}

export default function VehicleBrandForm({ 
  brand,
  isCreate = false,
  onSuccess 
}: VehicleBrandFormProps) {
  const { __ } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(brand.logo_url || null);

  // Initialize form with default values
  const { data, setData, submit, processing, errors, recentlySuccessful, progress } = useForm<VehicleBrandFormData>({
    name: brand.name || '',
    logo: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setData('logo', file);
      
      // Create a preview URL for the selected file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Cleanup the URL when component unmounts
      return () => URL.revokeObjectURL(url);
    }
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Use Inertia's form submission which automatically handles CSRF tokens
    if (isCreate) {
      submit('post', route("global-settings.vehicle-brands.store"), {
        forceFormData: true,
        onSuccess: () => {
          if (onSuccess) onSuccess();
        }
      });
    } else if (brand.id) {
      submit('put', route("global-settings.vehicle-brands.update", { vehicle_brand: brand.id }), {
        forceFormData: true,
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
            {isCreate ? __("global_settings.vehicle_brands.create.title") : __("global_settings.vehicle_brands.edit.title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("global_settings.vehicle_brands.create.description")
              : __("global_settings.vehicle_brands.edit.description", { name: brand.name || '' })}
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
              placeholder={__("global_settings.vehicle_brands.placeholders.name")}
              className="mt-1"
              required
            />
            <FormError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="logo" className="text-sm font-medium">
              {__("common.logo")}
            </Label>
            
            {previewUrl && (
              <div className="mt-2 mb-4">
                <p className="text-sm text-muted-foreground mb-2">{__('common.current_logo')}:</p>
                <img 
                  src={previewUrl} 
                  alt={data.name} 
                  className="h-16 w-16 object-contain border rounded-md p-1"
                />
              </div>
            )}
            
            <Input
              id="logo"
              type="file"
              onChange={handleFileChange}
              className="mt-1"
              accept="image/*"
            />
            
            {progress && (
              <progress value={progress.percentage} max="100" className="mt-2 w-full">
                {progress.percentage}%
              </progress>
            )}
            
            {!isCreate && (
              <p className="text-sm text-muted-foreground mt-1">{__('common.leave_empty_to_keep_current_logo')}</p>
            )}
            
            <FormError message={errors.logo} />
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