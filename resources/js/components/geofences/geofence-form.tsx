import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/utils/translation";
import { useTenantUser } from "@/utils/permissions";
import { TenantResource, GroupResource, GeofenceResource } from "@/types";
import { FormError } from "@/components/form-error";
import { MapPin, Save } from "lucide-react";
import { usePage } from "@inertiajs/react";
import GeofenceDrawingMap from "@/components/maps/geofence-drawing-map";

interface GeofenceFormProps {
  geofence?: GeofenceResource;
  tenants: TenantResource[];
  groups: GroupResource[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

export default function GeofenceForm({ 
  geofence,
  tenants, 
  groups,
  isCreate = false,
  onSuccess 
}: GeofenceFormProps) {
  const { __ } = useTranslation();
  const isTenantUser = useTenantUser();
  const { auth } = usePage().props as { auth: { user: { tenant_id?: string } } };

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: geofence?.name || '',
    tenant_id: geofence?.tenant_id || (auth.user?.tenant_id || ''),
    group_id: geofence?.group_id || '',
    geojson: geofence?.geojson || null,
    is_active: geofence?.is_active ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isCreate) {
      post(route('geofences.store'), {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      });
    } else {
      put(route('geofences.update', { geofence: geofence?.id }), {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  }

  const renderFormFields = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {__('geofences.form.basic_information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {__("geofences.fields.name")} 
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                placeholder={__("geofences.placeholders.name")}
                className="mt-1"
              />
              <FormError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_id" className="text-sm font-medium">
                {__("geofences.fields.group")}
              </Label>
              <Select
                value={data.group_id || 'none'}
                onValueChange={(value) => setData("group_id", value === 'none' ? '' : value)}
              >
                <SelectTrigger id="group_id" className="mt-1">
                  <SelectValue placeholder={__("geofences.placeholders.group")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{__("common.none")}</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={errors.group_id} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData("is_active", checked)}
            />
            <Label htmlFor="is_active" className="text-sm font-medium">
              {__("geofences.fields.is_active")}
            </Label>
          </div>
          <FormError message={errors.is_active} />
        </CardContent>
      </Card>

      {/* Tenant Assignment - Only for central users */}
      {!isTenantUser && (
        <>
          <Separator className="my-6" />
          
          <Card>
            <CardHeader>
              <CardTitle>{__('geofences.form.tenant_assignment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="tenant_id" className="text-sm font-medium">
                  {__("geofences.fields.tenant")} 
                  <span className="text-destructive"> *</span>
                </Label>
                <Select
                  value={data.tenant_id || 'none'}
                  onValueChange={(value) => setData("tenant_id", value === 'none' ? '' : value)}
                >
                  <SelectTrigger id="tenant_id" className="mt-1">
                    <SelectValue placeholder={__("geofences.placeholders.tenant")} />
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Map Drawing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {__('geofences.form.map_drawing')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {__("geofences.form.map_description")}
          </div>
          
          <GeofenceDrawingMap
            key={geofence?.id || 'new'}
            height="500px"
            initialGeojson={data.geojson as GeoJSON.Geometry | null}
            onGeofenceChange={(geojson) => setData("geojson", geojson as typeof data.geojson)}
            showExistingGeofences={false}
          />
          
          <FormError message={errors.geojson} />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderFormFields()}

      <div className="flex items-center justify-end space-x-4 pt-6">
        <Button
          type="submit"
          disabled={processing}
          className="min-w-[120px]"
        >
          <Save className="mr-2 h-4 w-4" />
          {processing 
            ? __('common.saving') 
            : isCreate 
              ? __('geofences.actions.create') 
              : __('common.save')
          }
        </Button>
      </div>
    </form>
  );
} 