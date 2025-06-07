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
import { DriverResource, TenantResource, UserResource, GroupResource } from "@/types/resources";
import { DriverAnalysisData, AnalysisData } from "@/types/analysis";
import { usePage } from '@inertiajs/react';
import { SharedData } from "@/types";

// European countries list for driver cards
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

interface DriverFormProps {
  driver: Partial<DriverResource>;
  tenants: TenantResource[];
  users: UserResource[];
  groups: GroupResource[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type
interface DriverFormData {
  surname: string;
  firstname: string;
  phone: string;
  license_number: string;
  card_issuing_country: string;
  card_number: string;
  birthdate: string;
  card_issuing_date: string;
  card_expiration_date: string;
  tenant_id: string | null;
  user_id: number | null;
  group_id: string | null;
  [key: string]: string | number | null | undefined;
}

export default function DriverForm({ 
  driver,
  tenants, 
  users,
  groups,
  isCreate = false,
  onSuccess 
}: DriverFormProps) {
  const { __ } = useTranslation();
  
  // State for tab navigation
  const [activeTab, setActiveTab] = useState("manual");
  // Filtered users based on selected tenant
  const [filteredUsers, setFilteredUsers] = useState<UserResource[]>([]);
  
  const { auth } = usePage<SharedData>().props;

  // Initialize form with default values
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<DriverFormData>({
    surname: driver.surname || '',
    firstname: driver.firstname || '',
    phone: driver.phone || '',
    license_number: driver.license_number || '',
    card_issuing_country: driver.card_issuing_country || '',
    card_number: driver.card_number || '',
    birthdate: driver.birthdate || '',
    card_issuing_date: driver.card_issuing_date || '',
    card_expiration_date: driver.card_expiration_date || '',
    tenant_id: driver.tenant_id || null,
    user_id: driver.user_id || null,
    group_id: driver.group_id || null,
  });

  // Update filtered users when tenant selection changes
  useEffect(() => {
    if (!data.tenant_id) {
      setFilteredUsers([]);
      return;
    }

    // Filter users belonging to selected tenant or without tenant
    const tenantUsers = users.filter(user => 
      user.tenant_id === data.tenant_id || !user.tenant_id
    );
    
    setFilteredUsers(tenantUsers);
    
    // Reset user selection if current user doesn't belong to selected tenant
    if (data.user_id !== null) {
      const userExists = tenantUsers.some(user => user.id === data.user_id);
      if (!userExists) {
        setData('user_id', null);
      }
    }
  }, [data.tenant_id, users]);

  // Handle analysis completion
  const handleAnalysisComplete = (analysisData: DriverAnalysisData) => {
    // Create a properly typed updatedData object
    const updatedData = {
      ...data,
      firstname: analysisData.first_name || data.firstname,
      surname: analysisData.last_name || data.surname,
      license_number: analysisData.license_number || data.license_number,
      card_number: analysisData.card_number || data.card_number,
      card_issuing_country: analysisData.country_code || data.card_issuing_country,
    };

    // Format dates if available
    if (analysisData.date_of_birth) {
      updatedData.birthdate = formatDateForInput(analysisData.date_of_birth);
    }
    
    if (analysisData.issue_date) {
      updatedData.card_issuing_date = formatDateForInput(analysisData.issue_date);
    }
    
    if (analysisData.expiry_date) {
      updatedData.card_expiration_date = formatDateForInput(analysisData.expiry_date);
    }

    setData(updatedData);
  };

  // Format date strings to YYYY-MM-DD for input elements
  const formatDateForInput = (dateString: string): string => {
    try {
      // Try to parse the date - may come in different formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing failed
      }
      
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Use Inertia's form submission which automatically handles CSRF tokens
    if (isCreate) {
      submit('post', route("drivers.store"));
    } else if (driver.id) {
      submit('put', route("drivers.update", { driver: driver.id }));
    }
    
    // Handle success callback if needed
    if (onSuccess) {
      onSuccess();
    }
  }

  function handleTenantChange(value: string) {
    setData('tenant_id', value === 'none' ? null : value);
    setData('user_id', null);
  }

  function handleUserChange(value: string) {
    setData('user_id', value === 'none' ? null : parseInt(value, 10));
  }

  function handleCountryChange(value: string) {
    setData('card_issuing_country', value);
  }

  function handleGroupChange(value: string) {
    setData('group_id', value === 'none' ? null : value);
  }

  const driverName = `${driver.firstname || ''} ${driver.surname || ''}`.trim();

  const renderFormFields = () => (
    <CardContent className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{__("drivers.sections.driver_info")}</h3>
        <p className="text-sm text-muted-foreground">{__("drivers.sections.driver_info_description")}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="surname" className="text-sm font-medium">
            {__("drivers.fields.surname")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="surname"
            type="text"
            value={data.surname}
            onChange={(e) => setData("surname", e.target.value)}
            placeholder={__("drivers.placeholders.surname")}
            className="mt-1"
          />
          <FormError message={errors.surname} />
        </div>

        <div>
          <Label htmlFor="firstname" className="text-sm font-medium">
            {__("drivers.fields.firstname")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstname"
            type="text"
            value={data.firstname}
            onChange={(e) => setData("firstname", e.target.value)}
            placeholder={__("drivers.placeholders.firstname")}
            className="mt-1"
          />
          <FormError message={errors.firstname} />
        </div>
        
        <div>
          <Label htmlFor="phone" className="text-sm font-medium">
            {__("drivers.fields.phone")}
          </Label>
          <Input
            id="phone"
            type="text"
            value={data.phone}
            onChange={(e) => setData("phone", e.target.value)}
            placeholder={__("drivers.placeholders.phone")}
            className="mt-1"
          />
          <FormError message={errors.phone} />
        </div>
        
        <div>
          <Label htmlFor="birthdate" className="text-sm font-medium">
            {__("drivers.fields.birthdate")}
          </Label>
          <Input
            id="birthdate"
            type="date"
            value={data.birthdate}
            onChange={(e) => setData("birthdate", e.target.value)}
            className="mt-1"
          />
          <FormError message={errors.birthdate} />
        </div>
      </div>

      {/* License Information */}
      <Separator className="my-4" />
      
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{__("drivers.sections.license_info")}</h3>
        <p className="text-sm text-muted-foreground">{__("drivers.sections.license_info_description")}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="license_number" className="text-sm font-medium">
            {__("drivers.fields.license_number")}
          </Label>
          <Input
            id="license_number"
            type="text"
            value={data.license_number}
            onChange={(e) => setData("license_number", e.target.value)}
            placeholder={__("drivers.placeholders.license_number")}
            className="mt-1"
          />
          <FormError message={errors.license_number} />
        </div>
        
        <div>
          <Label htmlFor="card_number" className="text-sm font-medium">
            {__("drivers.fields.card_number")}
          </Label>
          <Input
            id="card_number"
            type="text"
            value={data.card_number}
            onChange={(e) => setData("card_number", e.target.value)}
            placeholder={__("drivers.placeholders.card_number")}
            className="mt-1"
          />
          <FormError message={errors.card_number} />
        </div>
        
        <div>
          <Label htmlFor="card_issuing_country" className="text-sm font-medium">
            {__("drivers.fields.card_issuing_country")}
          </Label>
          <Select
            value={data.card_issuing_country}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger id="card_issuing_country" className="mt-1">
              <SelectValue placeholder={__("drivers.placeholders.card_issuing_country")} />
            </SelectTrigger>
            <SelectContent>
              {europeanCountries.map((country) => (
                <SelectItem key={`country-${country.code}`} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormError message={errors.card_issuing_country} />
        </div>
        
        <div>
          <Label htmlFor="card_issuing_date" className="text-sm font-medium">
            {__("drivers.fields.card_issuing_date")}
          </Label>
          <Input
            id="card_issuing_date"
            type="date"
            value={data.card_issuing_date}
            onChange={(e) => setData("card_issuing_date", e.target.value)}
            className="mt-1"
          />
          <FormError message={errors.card_issuing_date} />
        </div>
        
        <div>
          <Label htmlFor="card_expiration_date" className="text-sm font-medium">
            {__("drivers.fields.card_expiration_date")}
          </Label>
          <Input
            id="card_expiration_date"
            type="date"
            value={data.card_expiration_date}
            onChange={(e) => setData("card_expiration_date", e.target.value)}
            className="mt-1"
          />
          <FormError message={errors.card_expiration_date} />
        </div>
      </div>

      {!auth.user?.tenant_id && (
        <>
          <Separator className="my-4" />
          
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{__("drivers.sections.assignment")}</h3>
            <p className="text-sm text-muted-foreground">{__("drivers.sections.assignment_description")}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="tenant_id" className="text-sm font-medium">
                {__("drivers.fields.tenant")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.tenant_id ?? ''}
                onValueChange={handleTenantChange}
              >
                <SelectTrigger id="tenant_id" className="mt-1">
                  <SelectValue placeholder={__("drivers.placeholders.tenant")} />
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

            <div>
              <Label htmlFor="user_id" className="text-sm font-medium">
                {__("drivers.fields.user")}
              </Label>
              <Select
                value={data.user_id?.toString() ?? ''}
                onValueChange={handleUserChange}
                disabled={!data.tenant_id}
              >
                <SelectTrigger id="user_id" className="mt-1">
                  <SelectValue placeholder={
                    !data.tenant_id
                      ? __("drivers.select_tenant_first")
                      : __("drivers.placeholders.user")
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{__("common.none")}</SelectItem>
                  {filteredUsers.map((user) => (
                    <SelectItem key={`user-${user.id}`} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={errors.user_id} />
            </div>
          </div>
        </>
      )}

      {/* Group Assignment - Available for both central and tenant users */}
      <Separator className="my-4" />
      
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{__("drivers.sections.group_assignment")}</h3>
        <p className="text-sm text-muted-foreground">{__("drivers.sections.group_assignment_description")}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="group_id" className="text-sm font-medium">
            {__("drivers.fields.group")}
          </Label>
          <Select
            value={data.group_id ?? ''}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger id="group_id" className="mt-1">
              <SelectValue placeholder={__("drivers.placeholders.group")} />
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
          {isCreate ? __("drivers.create.submit_button") : __("common.save")}
        </Button>
      </div>
    </CardFooter>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreate ? __("drivers.create.card.title") : __("drivers.edit.form_title")}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __("drivers.create.card.description")
              : __("drivers.edit.form_description", { name: driverName || '' })}
          </CardDescription>
        </CardHeader>
        
        {isCreate ? (
          <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="manual">{__("drivers.input_methods.manual")}</TabsTrigger>
                <TabsTrigger value="scan">{__("drivers.input_methods.scan")}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="scan" className="mt-4 px-6">
              <ImageAnalysisUpload
                analysisType="driver"
                onAnalysisComplete={(data: AnalysisData) => handleAnalysisComplete(data as DriverAnalysisData)}
                onChangeTab={setActiveTab}
                apiEndpoint={route('drivers.scan-document')}
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