import React, { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FormattedDate from '@/components/formatted-date';
import { cn } from '@/lib/utils';
import { AlertResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  List, 
  Eye,
  User,
  Building2,
  Car,
  Cpu
} from 'lucide-react';

interface AlertsLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    alert?: AlertResource;
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

export default function AlertsLayout({ children, showSidebar = false, alert }: AlertsLayoutProps) {
    const { __ } = useTranslation();

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems = [];

    if (alert) {
        sidebarNavItems.push({
            title: __('alerts.sidebar.details'),
            href: route('alerts.show', { alert: alert.id }),
            icon: Eye,
        });
    }

    // Always add the alerts list navigation item
    sidebarNavItems.push({
        title: __('alerts.sidebar.all_alerts'),
        href: route('alerts.index'),
        icon: List,
    });

    return (
        <div className="px-4 py-6">
            {showSidebar && alert ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
                        {/* Alert Info Card */}
                        <div className="mb-4 flex flex-col">
                            <div className="mb-2 flex w-full items-center justify-center space-x-2">
                                {React.createElement(getSeverityIcon(alert.severity), {
                                    className: cn('h-5 w-5', getSeverityColor(alert.severity))
                                })}
                                <Badge 
                                    variant={
                                        alert.severity === 'error' ? 'destructive' : 
                                        alert.severity === 'warning' ? 'secondary' : 'default'
                                    }
                                >
                                    {__(`alerts.severity.${alert.severity}`)}
                                </Badge>
                            </div>

                            {/* Alert Title */}
                            <div className="mt-2 text-center">
                                <span className="text-sm font-medium">
                                    {alert.title}
                                </span>
                                {!alert.is_read && (
                                    <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full inline-block" />
                                )}
                            </div>
                            

                        </div>

                        {/* Alert Info */}
                        <Card className="mb-4 py-1">
                            <CardContent className="space-y-2 p-3">
                                {/* Created Date */}
                                <div className="flex items-start">
                                    <Building2 className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-muted-foreground text-xs">
                                            {__('common.created_at')}
                                        </div>
                                        <FormattedDate 
                                            date={alert.created_at} 
                                            format="RELATIVE" 
                                            className="truncate text-xs font-medium" 
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-start">
                                    <Eye className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-muted-foreground text-xs">
                                            {__('alerts.fields.status')}
                                        </div>
                                        <Badge 
                                            variant={alert.is_read ? "default" : "secondary"}
                                            className="h-5 text-xs font-medium"
                                        >
                                            {alert.is_read ? __('alerts.status.read') : __('alerts.status.unread')}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Created By */}
                                {alert.created_by && (
                                    <div className="flex items-start">
                                        <User className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                {__('alerts.fields.created_by')}
                                            </div>
                                            <div className="truncate text-xs font-medium">
                                                {alert.created_by.name}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Expires At */}
                                {alert.expires_at && (
                                    <div className="flex items-start">
                                        <AlertTriangle className="text-muted-foreground mt-0.5 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">
                                                {__('alerts.fields.expires_at')}
                                            </div>
                                            <FormattedDate 
                                                date={alert.expires_at} 
                                                format="RELATIVE" 
                                                className="truncate text-xs font-medium" 
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Related Entity Card */}
                        {alert.alertable && (
                            <Card className="mb-4 py-1">
                                <CardContent className="p-3">
                                    <div className="text-muted-foreground text-xs mb-2">
                                        {__('alerts.fields.related_entity')}
                                    </div>
                                    
                                    {(() => {
                                        const entityType = alert.alertable_type.toLowerCase().replace('app\\models\\', '');
                                        let entityName = '';
                                        let entityHref = '';
                                        let EntityIcon = Building2;

                                                                                 switch (entityType) {
                                             case 'vehicle': {
                                                 const vehicle = alert.alertable as { registration?: string };
                                                 EntityIcon = Car;
                                                 entityName = vehicle.registration || __('common.unknown');
                                                 entityHref = route('vehicles.show', { vehicle: alert.alertable_id });
                                                 break;
                                             }
                                             case 'driver': {
                                                 const driver = alert.alertable as { surname?: string; firstname?: string };
                                                 EntityIcon = User;
                                                 entityName = `${driver.surname || ''} ${driver.firstname || ''}`.trim();
                                                 entityHref = route('drivers.show', { driver: alert.alertable_id });
                                                 break;
                                             }
                                             case 'device': {
                                                 const device = alert.alertable as { serial_number?: string };
                                                 EntityIcon = Cpu;
                                                 entityName = device.serial_number || __('common.unknown');
                                                 entityHref = route('devices.show', { device: alert.alertable_id });
                                                 break;
                                             }
                                             default:
                                                 entityName = __('common.unknown');
                                         }

                                        return entityHref ? (
                                            <Link 
                                                href={entityHref}
                                                className="flex items-center hover:underline text-primary"
                                            >
                                                <EntityIcon className="mr-2 h-4 w-4" />
                                                <span className="text-sm font-medium">{entityName}</span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center">
                                                <EntityIcon className="mr-2 h-4 w-4" />
                                                <span className="text-sm font-medium">{entityName}</span>
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation */}
                        <div className="mb-1.5 px-1 text-xs font-medium">{__('alerts.sidebar.navigation')}</div>
                        <nav className="flex flex-col space-y-0.5">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('h-8 w-full justify-start text-sm', {
                                            'bg-muted': item.href.endsWith(currentPath),
                                        })}
                                    >
                                        <Link href={item.href} prefetch>
                                            {Icon && <Icon className="mr-2 h-3.5 w-3.5" />}
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <Separator className="my-6 md:hidden" />

                    <div className="flex-1">
                        <section className="space-y-12">{children}</section>
                    </div>
                </div>
            ) : (
                <div>{children}</div>
            )}
        </div>
    );
} 