import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Cpu, Building, Truck } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import DevicesLayout from '@/layouts/devices/layout';
import HeadingSmall from '@/components/heading-small';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { type BreadcrumbItem, DeviceResource } from "@/types";
import FormattedDate from '@/components/formatted-date';
import EntityAlerts from "@/components/alerts/entity-alerts";
import { usePermission } from "@/utils/permissions";

// Extend DeviceResource to include fields needed for the show page
interface ExtendedDeviceResource extends DeviceResource {
  device_type_id: number;
  deleted_at?: string | null;
  last_contact_at: string | null;
}

interface DeviceShowProps {
  device: ExtendedDeviceResource;
}

export default function Show({ device }: DeviceShowProps) {
  const { __ } = useTranslation();
  const canEditDevices = usePermission('edit_devices');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.breadcrumbs.show'),
      href: route('devices.show', { device: device.id }),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__("devices.single") + ": " + device.serial_number} />

      <DevicesLayout showSidebar={true} device={device}>
        <div className="space-y-6">
          <HeadingSmall
            title={__("devices.show.heading")}
            description={__("devices.show.description")}
          />

          <div className="flex justify-end space-x-2">
            {canEditDevices && (
              <Button asChild>
                <Link href={route("devices.edit", { device: device.id })}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {__("common.edit")}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={route("devices.index")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {__("devices.actions.back_to_list")}
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2" /> {device.serial_number}
              </CardTitle>
              <CardDescription>
                {device.type ? `${device.type.manufacturer} - ${device.type.name}` : __("common.unknown")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium w-1/3">{__("devices.fields.imei")}</TableCell>
                    <TableCell>{device.imei}</TableCell>
                  </TableRow>
                  {device.sim_number && (
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.sim_number")}</TableCell>
                      <TableCell>{device.sim_number}</TableCell>
                    </TableRow>
                  )}
                  {device.firmware_version && (
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.firmware_version")}</TableCell>
                      <TableCell>{device.firmware_version}</TableCell>
                    </TableRow>
                  )}
                  {device.last_contact_at && (
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.last_contact")}</TableCell>
                      <TableCell>
                        {device.last_contact_at ? <FormattedDate date={device.last_contact_at} format="DATETIME_FULL" /> : '-'}
                      </TableCell>
                    </TableRow>
                  )}
                  {device.tenant && (
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.tenant")}</TableCell>
                      <TableCell className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Link 
                          href={route("tenants.show", { tenant: device.tenant.id })}
                          className="text-primary hover:underline"
                        >
                          {device.tenant.name}
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                  {device.vehicle && (
                    <TableRow>
                      <TableCell className="font-medium">{__("devices.fields.vehicle")}</TableCell>
                      <TableCell className="flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Link 
                          href={route("vehicles.show", { vehicle: device.vehicle.id })}
                          className="text-primary hover:underline"
                        >
                          {device.vehicle.registration}
                        </Link>
                        {device.vehicle.tenant && device.vehicle.tenant.id !== device.tenant_id && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({__("devices.different_tenant")})
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">{__("common.created_at")}</TableCell>
                    <TableCell>
                      {device.created_at ? <FormattedDate date={device.created_at} format="DATE_MED" /> : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{__("common.updated_at")}</TableCell>
                    <TableCell>
                      {device.updated_at ? <FormattedDate date={device.updated_at} format="DATE_MED" /> : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <EntityAlerts
            entityType="device"
            entityId={device.id}
            entityName={device.serial_number}
          />
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 