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
import { type DriverAnalysisData } from "@/types/analysis";

interface Driver {
  id: string; // UUID
  firstname: string;
  surname: string;
  phone: string;
  license_number: string;
  card_issuing_country: string;
  card_number: string;
  birthdate: string;
  card_issuing_date: string;
  card_expiration_date: string;
  tenant_id: string | null; // UUID
  user_id: number | null; // User ID
}

interface DriverFormProps {
  driver: Driver;
  tenants: { id: string; name: string }[]; // UUID
  users: { id: number; name: string; email: string; tenant_id?: string | null }[];
  isCreate?: boolean;
  onSuccess?: () => void;
}

// Define the form data type with index signature to satisfy FormDataType
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
  tenant_id: string;
  user_id: number | null;
  [key: string]: string | number | null | undefined;
}

export default function DriverForm({ 
  driver,
  tenants, 
  users,
  isCreate = false,
  onSuccess 
}: DriverFormProps) {
  const { __ } = useTranslation();
  
  // State for tab navigation
  const [activeTab, setActiveTab] = useState("manual");
  // Filtered users based on selected tenant
  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);
  
  const formUrl = isCreate 
    ? route("drivers.store") 
    : (driver.id ? route("drivers.update", driver.id) : '');
  
  // Initialize form with default values
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm<DriverFormData>({
    surname: driver.surname || '',
    firstname: driver.firstname || '',
    phone: driver.phone || '',
    license_number: driver.license_number || '',
    card_issuing_country: driver.card_issuing_country || '',
    card_number: driver.card_number || '',
    birthdate: driver.birthdate || '',
    card_issuing_date: driver.card_issuing_date || '',
    card_expiration_date: driver.card_expiration_date || '',
    tenant_id: driver.tenant_id || '',
    user_id: driver.user_id,
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
      card_number: analysisData.license_number || data.card_number, // Often the same as license number
      card_issuing_country: analysisData.country_code || data.card_issuing_country, // Use the country code
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
    post(formUrl);
    
    // Handle success callback if needed
    if (onSuccess) {
      onSuccess();
    }
  }

  const driverName = `${driver.firstname} ${driver.surname}`.trim();

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
                onAnalysisComplete={(data) => handleAnalysisComplete(data as DriverAnalysisData)}
                onChangeTab={setActiveTab}
                apiEndpoint={route('drivers.scan-document')}
              />
            </TabsContent>
            
            <TabsContent value="manual">
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

                <Separator className="my-6" />

                {/* License Information */}
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
                    <Input
                      id="card_issuing_country"
                      type="text"
                      value={data.card_issuing_country}
                      onChange={(e) => setData("card_issuing_country", e.target.value)}
                      placeholder={__("drivers.placeholders.card_issuing_country")}
                      className="mt-1"
                    />
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

                <Separator className="my-6" />

                {/* Organization Information */}
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{__("drivers.sections.tenant_info")}</h3>
                  <p className="text-sm text-muted-foreground">{__("drivers.sections.tenant_info_description")}</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant_id" className="text-sm font-medium">
                      {__("drivers.fields.tenant")} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={data.tenant_id}
                      onValueChange={(value) => setData("tenant_id", value)}
                    >
                      <SelectTrigger id="tenant_id" className="mt-1">
                        <SelectValue placeholder={__("drivers.placeholders.tenant")} />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={`tenant-${tenant.id}`} value={tenant.id}>
                            {tenant.name || ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormError message={errors.tenant_id} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_id" className="text-sm font-medium">
                      {__("drivers.fields.user")}
                    </Label>
                    <Select
                      value={data.user_id?.toString() || 'none'}
                      onValueChange={(value) => setData("user_id", value === 'none' ? null : parseInt(value))}
                      disabled={!data.tenant_id || filteredUsers.length === 0}
                    >
                      <SelectTrigger id="user_id" className="mt-1">
                        <SelectValue placeholder={__("drivers.placeholders.user")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {__("common.none")}
                        </SelectItem>
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
                      {__('drivers.create.success_message')}
                    </p>
                  </Transition>
                  
                  <Button type="submit" disabled={processing}>
                    <Save className="mr-2 h-4 w-4" />
                    {__("drivers.create.submit_button")}
                  </Button>
                </div>
              </CardFooter>
            </TabsContent>
          </Tabs>
        ) : (
          <>
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

              <Separator className="my-6" />

              {/* License Information */}
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
                  <Input
                    id="card_issuing_country"
                    type="text"
                    value={data.card_issuing_country}
                    onChange={(e) => setData("card_issuing_country", e.target.value)}
                    placeholder={__("drivers.placeholders.card_issuing_country")}
                    className="mt-1"
                  />
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

              <Separator className="my-6" />

              {/* Organization Information */}
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{__("drivers.sections.tenant_info")}</h3>
                <p className="text-sm text-muted-foreground">{__("drivers.sections.tenant_info_description")}</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant_id" className="text-sm font-medium">
                    {__("drivers.fields.tenant")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.tenant_id}
                    onValueChange={(value) => setData("tenant_id", value)}
                  >
                    <SelectTrigger id="tenant_id" className="mt-1">
                      <SelectValue placeholder={__("drivers.placeholders.tenant")} />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={`tenant-${tenant.id}`} value={tenant.id}>
                          {tenant.name || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.tenant_id} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_id" className="text-sm font-medium">
                    {__("drivers.fields.user")}
                  </Label>
                  <Select
                    value={data.user_id?.toString() || 'none'}
                    onValueChange={(value) => setData("user_id", value === 'none' ? null : parseInt(value))}
                    disabled={!data.tenant_id || filteredUsers.length === 0}
                  >
                    <SelectTrigger id="user_id" className="mt-1">
                      <SelectValue placeholder={__("drivers.placeholders.user")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {__("common.none")}
                      </SelectItem>
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