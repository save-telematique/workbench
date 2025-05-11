import { Head } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { PenBox, Trash, RotateCcw, Building, User } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { usePermission } from "@/utils/permissions";
import { DeleteDriverDialog } from "./dialogs/delete-dialog";
import { RestoreDriverDialog } from "./dialogs/restore-dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import FormattedDate from "@/components/formatted-date";
import { DriverCard } from "@/components/drivers/driver-card";
import { DriverResource } from "@/types";

interface ShowDriverProps {
  driver: DriverResource;
}

export default function Show({ driver }: ShowDriverProps) {
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
      href: route('drivers.show', { driver: driver.id }),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${driver.surname} ${driver.firstname} - ${__("drivers.title")}`} />

      <DriversLayout showSidebar={true} driver={driver}>
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
                <Link href={route("drivers.edit", { driver: driver.id })}>
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

        <div className="mb-6 max-w-lg ml-0">
          <DriverCard driver={driver} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{__("drivers.show.sections.details.title")}</CardTitle>
            <CardDescription>{__("drivers.show.sections.details.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.surname")}</TableCell>
                  <TableCell>{driver.surname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.firstname")}</TableCell>
                  <TableCell>{driver.firstname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.phone")}</TableCell>
                  <TableCell>{driver.phone || __("common.none")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.birthdate")}</TableCell>
                  <TableCell>
                    {driver.birthdate ? 
                      <FormattedDate date={driver.birthdate} format="DATE_MED" /> : 
                      __("common.none")
                    }
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.license_number")}</TableCell>
                  <TableCell>{driver.license_number || __("common.none")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.card_issuing_country")}</TableCell>
                  <TableCell>{driver.card_issuing_country || __("common.none")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.card_number")}</TableCell>
                  <TableCell>{driver.card_number || __("common.none")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.card_issuing_date")}</TableCell>
                  <TableCell>
                    {driver.card_issuing_date ? 
                      <FormattedDate date={driver.card_issuing_date} format="DATE_MED" /> : 
                      __("common.none")
                    }
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.card_expiration_date")}</TableCell>
                  <TableCell>
                    {driver.card_expiration_date ? 
                      <FormattedDate date={driver.card_expiration_date} format="DATE_MED" /> : 
                      __("common.none")
                    }
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.tenant")}</TableCell>
                  <TableCell>
                    {driver.tenant ? (
                      <Link 
                        href={route("tenants.show", { tenant: driver.tenant.id })}
                        className="flex items-center hover:underline text-primary"
                      >
                        <Building className="mr-2 h-4 w-4" />
                        {driver.tenant.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{__("common.none")}</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{__("drivers.fields.user")}</TableCell>
                  <TableCell>
                    {driver.user ? (
                      <Link 
                        href={route("users.show", { user: driver.user.id })}
                        className="flex items-center hover:underline text-primary"
                      >
                        <User className="mr-2 h-4 w-4" />
                        {driver.user.name} ({driver.user.email})
                      </Link>
                    ) : (
                      <span className="text-gray-400">{__("common.none")}</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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