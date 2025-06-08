import { Head, Link } from "@inertiajs/react";
import { type BreadcrumbItem, AlertResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { usePermission } from "@/utils/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Building,
  Car,
  User,
  Cpu
} from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import AlertsLayout from "@/layouts/alerts/layout";
import FormattedDate from "@/components/formatted-date";
import { formatDistanceToNow } from "date-fns";
import { router } from "@inertiajs/react";
import { cn } from "@/lib/utils";

interface AlertShowProps {
  alert: AlertResource;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'info':
      return Info;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return XCircle;
    case 'success':
      return CheckCircle;
    default:
      return Info;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'info':
      return 'text-blue-500';
    case 'warning':
      return 'text-amber-500';
    case 'error':
      return 'text-destructive';
    case 'success':
      return 'text-green-500';
    default:
      return 'text-blue-500';
  }
};

export default function Show({ alert }: AlertShowProps) {
  const { __ } = useTranslation();
  const canEditAlerts = usePermission('edit_alerts');
  const SeverityIcon = getSeverityIcon(alert.severity);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('alerts.breadcrumbs.index'),
      href: route('alerts.index'),
    },
    {
      title: alert.title,
      href: route('alerts.show', { alert: alert.id }),
    },
  ];

  const handleToggleRead = () => {
    if (alert.is_read) {
      router.patch(route('alerts.mark-as-unread', { alert: alert.id }));
    } else {
      router.patch(route('alerts.mark-as-read', { alert: alert.id }));
    }
  };

  const renderContent = () => {
    if (typeof alert.content === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <p>{alert.content}</p>
        </div>
      );
    }
    
    // Handle complex content with links, images, etc.
    return (
      <div className="space-y-4">
        {alert.content && typeof alert.content === 'object' && (
          <div className="text-sm">
            <pre className="whitespace-pre-wrap font-sans">
              {JSON.stringify(alert.content, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderMetadata = () => {
    if (!alert.metadata || Object.keys(alert.metadata).length === 0) {
      return null;
    }

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{__('alerts.fields.metadata')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alert.metadata.links && Array.isArray(alert.metadata.links) && (
              <div>
                <h5 className="font-medium mb-2">{__('alerts.metadata.links')}</h5>
                <div className="flex flex-wrap gap-2">
                                     {(alert.metadata.links as Array<{ url: string; text: string; external?: boolean }>).map((link, index) => (
                     <Button 
                       key={index} 
                       variant="outline" 
                       size="sm" 
                       asChild
                     >
                       {link.external ? (
                         <a href={link.url} target="_blank" rel="noopener noreferrer">
                           {link.text}
                         </a>
                       ) : (
                         <Link href={link.url}>
                           {link.text}
                         </Link>
                       )}
                     </Button>
                   ))}
                </div>
              </div>
            )}
            
            {alert.metadata.image && (
              <div>
                <h5 className="font-medium mb-2">{__('alerts.metadata.image')}</h5>
                <img 
                  src={alert.metadata.image as string} 
                  alt={alert.title}
                  className="max-w-sm rounded border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRelatedEntity = () => {
    if (!alert.alertable) return null;

    const entityType = alert.alertable_type.toLowerCase().replace('app\\models\\', '');
    let entityIcon, entityName, entityHref;

    switch (entityType) {
      case 'vehicle': {
        const vehicle = alert.alertable as { registration?: string };
        entityIcon = Car;
        entityName = vehicle.registration || __('common.unknown');
        entityHref = route('vehicles.show', { vehicle: alert.alertable_id });
        break;
      }
      case 'driver': {
        const driver = alert.alertable as { surname?: string; firstname?: string };
        entityIcon = User;
        entityName = `${driver.surname || ''} ${driver.firstname || ''}`.trim();
        entityHref = route('drivers.show', { driver: alert.alertable_id });
        break;
      }
      case 'device': {
        const device = alert.alertable as { serial_number?: string };
        entityIcon = Cpu;
        entityName = device.serial_number || __('common.unknown');
        entityHref = route('devices.show', { device: alert.alertable_id });
        break;
      }
      default:
        entityIcon = Building;
        entityName = __('common.unknown');
        entityHref = '';
    }

    const EntityIcon = entityIcon;

    return (
      <TableRow>
        <TableCell className="font-medium">{__('alerts.fields.related_entity')}</TableCell>
        <TableCell>
          {entityHref ? (
            <Link 
              href={entityHref}
              className="flex items-center hover:underline text-primary"
            >
              <EntityIcon className="mr-2 h-4 w-4" />
              {entityName}
            </Link>
          ) : (
            <div className="flex items-center">
              <EntityIcon className="mr-2 h-4 w-4" />
              {entityName}
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${alert.title} - ${__("alerts.title")}`} />

      <AlertsLayout showSidebar={true} alert={alert}>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex items-start space-x-3">
            <SeverityIcon className={cn(
              "h-6 w-6 mt-1",
              getSeverityColor(alert.severity)
            )} />
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                {alert.title}
                {!alert.is_read && (
                  <span className="h-3 w-3 bg-blue-500 rounded-full" />
                )}
              </h2>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={
                  alert.severity === 'error' ? 'destructive' : 
                  alert.severity === 'warning' ? 'secondary' : 'default'
                }>
                  {__(`alerts.severity.${alert.severity}`)}
                </Badge>
                
                <Badge variant="outline">
                  {__(`alerts.types.${alert.type}`) || alert.type}
                </Badge>
                
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleToggleRead}
            >
              {alert.is_read ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  {__('alerts.actions.mark_as_unread')}
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  {__('alerts.actions.mark_as_read')}
                </>
              )}
            </Button>

            {canEditAlerts && (
              <Button asChild variant="outline">
                <Link href={route("alerts.edit", { alert: alert.id })}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {__("common.edit")}
                </Link>
              </Button>
            )}

            <Button asChild variant="outline">
              <Link href={route("alerts.index")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {__("alerts.actions.back_to_list")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Alert Content */}
        <Card>
          <CardHeader>
            <CardTitle>{__("alerts.show.content_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {/* Alert Details */}
        <Card>
          <CardHeader>
            <CardTitle>{__("alerts.show.details_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{__("alerts.fields.type")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {__(`alerts.types.${alert.type}`) || alert.type}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">{__("alerts.fields.severity")}</TableCell>
                  <TableCell>
                    <Badge variant={
                      alert.severity === 'error' ? 'destructive' : 
                      alert.severity === 'warning' ? 'secondary' : 'default'
                    }>
                      {__(`alerts.severity.${alert.severity}`)}
                    </Badge>
                  </TableCell>
                </TableRow>

                {renderRelatedEntity()}

                <TableRow>
                  <TableCell className="font-medium">{__("alerts.fields.status")}</TableCell>
                  <TableCell>
                    <Badge variant={alert.is_read ? "default" : "secondary"}>
                      {alert.is_read ? __('alerts.status.read') : __('alerts.status.unread')}
                    </Badge>
                    {alert.is_read && alert.read_at && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({formatDistanceToNow(new Date(alert.read_at), { addSuffix: true })})
                      </span>
                    )}
                  </TableCell>
                </TableRow>

                {alert.created_by && (
                  <TableRow>
                    <TableCell className="font-medium">{__("alerts.fields.created_by")}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {alert.created_by.name}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                <TableRow>
                  <TableCell className="font-medium">{__("common.created_at")}</TableCell>
                  <TableCell>
                    <FormattedDate date={alert.created_at} format="DATETIME_FULL" />
                  </TableCell>
                </TableRow>

                {alert.expires_at && (
                  <TableRow>
                    <TableCell className="font-medium">{__("alerts.fields.expires_at")}</TableCell>
                    <TableCell>
                      <FormattedDate date={alert.expires_at} format="DATETIME_FULL" />
                    </TableCell>
                  </TableRow>
                )}

                <TableRow>
                  <TableCell className="font-medium">{__("alerts.fields.is_active")}</TableCell>
                  <TableCell>
                    <Badge variant={alert.is_active ? "default" : "secondary"}>
                      {alert.is_active ? __('common.active') : __('common.inactive')}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Metadata */}
        {renderMetadata()}
        </div>
      </AlertsLayout>
    </AppLayout>
  );
} 