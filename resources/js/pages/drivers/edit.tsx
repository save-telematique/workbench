import { Head, useForm } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useEffect, useState } from "react";



interface Driver {
  id: string;
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
}

interface EditDriverProps {
  driver: Driver;
  tenants: { id: string; name: string }[];
  users: { id: number; name: string; email: string; tenant_id?: string | null }[];
}

export default function Edit({ driver, tenants, users }: EditDriverProps) {
  const { __ } = useTranslation();
  
  const form = useForm<{
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
  }>({
    surname: driver.surname,
    firstname: driver.firstname,
    phone: driver.phone || "",
    license_number: driver.license_number || "",
    card_issuing_country: driver.card_issuing_country || "",
    card_number: driver.card_number || "",
    birthdate: driver.birthdate || "",
    card_issuing_date: driver.card_issuing_date || "",
    card_expiration_date: driver.card_expiration_date || "",
    tenant_id: driver.tenant_id,
    user_id: driver.user_id,
  });

  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);

  useEffect(() => {
    if (!form.data.tenant_id) {
      setFilteredUsers([]);
      return;
    }

    const tenantUsers = users.filter(user => 
      user.tenant_id === form.data.tenant_id || user.tenant_id === null || user.tenant_id === undefined
    );
    
    setFilteredUsers(tenantUsers);
    
    if (form.data.user_id !== null) {
      const userExists = tenantUsers.some(user => user.id === form.data.user_id);
      if (!userExists) {
        form.setData('user_id', null);
      }
    }
  }, [form.data.tenant_id, users]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('drivers.breadcrumbs.index'),
      href: route('drivers.index'),
    },
    {
      title: `${driver.surname} ${driver.firstname}`,
      href: route('drivers.show', driver.id),
    },
    {
      title: __('drivers.breadcrumbs.edit'),
      href: route('drivers.edit', driver.id),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.put(route('drivers.update', driver.id));
  };

  const handleTenantChange = (value: string) => {
    form.setData('tenant_id', value);
    form.setData('user_id', null);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("drivers.edit.title")} />

      <DriversLayout showSidebar={true} driverId={driver.id}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{__("drivers.edit.title")}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{__("drivers.sections.driver_info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="surname" className="text-sm font-medium">
                      {__("drivers.fields.surname")} <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      id="surname"
                      value={form.data.surname}
                      onChange={e => form.setData('surname', e.target.value)}
                    />
                    {form.errors.surname && (
                      <p className="text-sm text-destructive">{form.errors.surname}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="firstname" className="text-sm font-medium">
                      {__("drivers.fields.firstname")} <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      id="firstname"
                      value={form.data.firstname}
                      onChange={e => form.setData('firstname', e.target.value)}
                    />
                    {form.errors.firstname && (
                      <p className="text-sm text-destructive">{form.errors.firstname}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">{__("drivers.fields.phone")}</label>
                    <Input 
                      id="phone"
                      value={form.data.phone}
                      onChange={e => form.setData('phone', e.target.value)}
                      placeholder={__("drivers.placeholders.phone")}
                    />
                    {form.errors.phone && (
                      <p className="text-sm text-destructive">{form.errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="birthdate" className="text-sm font-medium">{__("drivers.fields.birthdate")}</label>
                    <Input 
                      id="birthdate"
                      type="date"
                      value={form.data.birthdate}
                      onChange={e => form.setData('birthdate', e.target.value)}
                    />
                    {form.errors.birthdate && (
                      <p className="text-sm text-destructive">{form.errors.birthdate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{__("drivers.sections.license_info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="license_number" className="text-sm font-medium">{__("drivers.fields.license_number")}</label>
                    <Input 
                      id="license_number"
                      value={form.data.license_number}
                      onChange={e => form.setData('license_number', e.target.value)}
                    />
                    {form.errors.license_number && (
                      <p className="text-sm text-destructive">{form.errors.license_number}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="card_issuing_country" className="text-sm font-medium">{__("drivers.fields.card_issuing_country")}</label>
                    <Input 
                      id="card_issuing_country"
                      value={form.data.card_issuing_country}
                      onChange={e => form.setData('card_issuing_country', e.target.value)}
                    />
                    {form.errors.card_issuing_country && (
                      <p className="text-sm text-destructive">{form.errors.card_issuing_country}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="card_number" className="text-sm font-medium">{__("drivers.fields.card_number")}</label>
                    <Input 
                      id="card_number"
                      value={form.data.card_number}
                      onChange={e => form.setData('card_number', e.target.value)}
                    />
                    {form.errors.card_number && (
                      <p className="text-sm text-destructive">{form.errors.card_number}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="card_issuing_date" className="text-sm font-medium">{__("drivers.fields.card_issuing_date")}</label>
                    <Input 
                      id="card_issuing_date"
                      type="date"
                      value={form.data.card_issuing_date}
                      onChange={e => form.setData('card_issuing_date', e.target.value)}
                    />
                    {form.errors.card_issuing_date && (
                      <p className="text-sm text-destructive">{form.errors.card_issuing_date}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="card_expiration_date" className="text-sm font-medium">{__("drivers.fields.card_expiration_date")}</label>
                    <Input 
                      id="card_expiration_date"
                      type="date"
                      value={form.data.card_expiration_date}
                      onChange={e => form.setData('card_expiration_date', e.target.value)}
                    />
                    {form.errors.card_expiration_date && (
                      <p className="text-sm text-destructive">{form.errors.card_expiration_date}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{__("drivers.sections.tenant_info")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="tenant_id" className="text-sm font-medium">
                    {__("drivers.fields.tenant")} <span className="text-destructive">*</span>
                  </label>
                  <Select 
                    value={form.data.tenant_id} 
                    onValueChange={handleTenantChange}
                  >
                    <SelectTrigger id="tenant_id">
                      <SelectValue placeholder={__("drivers.placeholders.tenant")} />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.tenant_id && (
                    <p className="text-sm text-destructive">{form.errors.tenant_id}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{__("drivers.sections.user_info")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="user_id" className="text-sm font-medium">{__("drivers.fields.user")}</label>
                  <Select 
                    value={form.data.user_id !== null ? form.data.user_id.toString() : "none"} 
                    onValueChange={(value) => form.setData('user_id', value === "none" ? null : parseInt(value))}
                    disabled={filteredUsers.length === 0}
                  >
                    <SelectTrigger id="user_id">
                      <SelectValue placeholder={__("drivers.placeholders.user")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{__("common.none")}</SelectItem>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                          {user.tenant_id === null && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {__("drivers.user_central")}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground">{__("drivers.no_users_for_tenant")}</p>
                  )}
                  {form.errors.user_id && (
                    <p className="text-sm text-destructive">{form.errors.user_id}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.processing}>
              {__("common.save")}
            </Button>
          </div>
        </form>
      </DriversLayout>
    </AppLayout>
  );
} 