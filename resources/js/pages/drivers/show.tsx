import { Head, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { PenBox, Trash, RotateCcw } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { usePermission } from "@/utils/permissions";
import { DeleteDriverDialog } from "./dialogs/delete-dialog";
import { RestoreDriverDialog } from "./dialogs/restore-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BreadcrumbItem {
  title: string;
  href: string;
}

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
  user_id: string;
  tenant?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ShowDriverProps {
  driver: Driver;
  tenants: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

export default function Show({ driver, tenants, users }: ShowDriverProps) {
  const { __ } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const canEditDrivers = usePermission("edit_drivers");
  const canDeleteDrivers = usePermission("delete_drivers");

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('drivers.breadcrumbs.index'),
      href: route('drivers.index'),
    },
    {
      title: `${driver.surname} ${driver.firstname}`,
      href: route('drivers.show', driver.id),
    },
  ];

  function handleTenantChange(tenantId: string) {
    router.put(
      route('drivers.update', driver.id),
      { tenant_id: tenantId },
      { preserveState: true }
    );
  }

  function handleUserChange(userId: string) {
    router.put(
      route('drivers.update', driver.id),
      { user_id: userId },
      { preserveState: true }
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${driver.surname} ${driver.firstname} - ${__("drivers.title")}`} />

      <DriversLayout showSidebar={true} driverId={driver.id}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{driver.surname} {driver.firstname}</h2>
            {driver.deleted_at && (
              <Badge variant="outline" className="mt-2">
                {__("common.deleted")}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {!driver.deleted_at && canEditDrivers && (
              <Button asChild variant="outline">
                <Link href={route("drivers.edit", driver.id)}>
                  <PenBox className="mr-2 h-4 w-4" />
                  {__("common.edit")}
                </Link>
              </Button>
            )}
            {!driver.deleted_at && canDeleteDrivers && (
              <Button variant="destructive" onClick={() => setOpenDeleteDialog(true)}>
                <Trash className="mr-2 h-4 w-4" />
                {__("common.delete")}
              </Button>
            )}
            {driver.deleted_at && canEditDrivers && (
              <Button variant="outline" onClick={() => setOpenRestoreDialog(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {__("common.restore")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{__("drivers.sections.driver_info")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.surname")}</p>
                  <p>{driver.surname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.firstname")}</p>
                  <p>{driver.firstname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.phone")}</p>
                  <p>{driver.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.birthdate")}</p>
                  <p>{driver.birthdate || "-"}</p>
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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.license_number")}</p>
                  <p>{driver.license_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.card_issuing_country")}</p>
                  <p>{driver.card_issuing_country || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.card_number")}</p>
                  <p>{driver.card_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.card_issuing_date")}</p>
                  <p>{driver.card_issuing_date || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{__("drivers.fields.card_expiration_date")}</p>
                  <p>{driver.card_expiration_date || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{__("drivers.sections.tenant_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{__("drivers.fields.tenant")}</p>
                  {canEditDrivers ? (
                    <Select
                      value={driver.tenant_id}
                      onValueChange={handleTenantChange}
                    >
                      <SelectTrigger className="w-full">
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
                  ) : (
                    <p>{driver.tenant?.name || "-"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{__("drivers.sections.user_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{__("drivers.fields.user")}</p>
                  {canEditDrivers ? (
                    <Select
                      value={driver.user_id || "none"}
                      onValueChange={handleUserChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={__("drivers.placeholders.user")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{__("common.none")}</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p>{driver.user ? `${driver.user.name} (${driver.user.email})` : "-"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DeleteDriverDialog
          open={openDeleteDialog}
          onOpenChange={() => setOpenDeleteDialog(false)}
          driver={driver}
        />

        <RestoreDriverDialog
          open={openRestoreDialog}
          onOpenChange={() => setOpenRestoreDialog(false)}
          driver={driver}
        />
      </DriversLayout>
    </AppLayout>
  );
} 