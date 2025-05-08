import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { NavItem as BaseNavItem } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Link } from '@inertiajs/react';
import { Cog, Info, MessageSquare, ChartBar, Signal, Clock, Server, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LicensePlate } from '@/components/ui/license-plate';
import { parseISO, formatDistanceToNow, isValid } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Extend the NavItem interface to include active property
interface DeviceNavItem extends BaseNavItem {
    active?: boolean;
}

// Define device display interface with all properties needed for the summary
interface DeviceDisplay {
    id: string;
    serial_number?: string;
    imei?: string;
    last_contact_at?: string;
    type?: {
        name?: string;
        manufacturer?: string;
    };
    vehicle?: {
        id: string;
        registration: string;
    };
    // Allow accessing name from the model's accessor
    name?: string;
}

interface DevicesLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    device?: DeviceDisplay;
}

// Device summary component
function DeviceSummary({ device }: { device: DeviceDisplay }) {
    const { __ } = useTranslation();
    const locale = document.documentElement.lang === 'fr' ? fr : enUS;
    
    // Determine status based on last contact time
    let status: 'online' | 'warning' | 'offline' = 'offline';
    let statusBadgeVariant: 'default' | 'destructive' | 'outline' | 'secondary' = 'destructive';
    let statusIcon = XCircle;
    let lastContactText = __('common.never');
    
    if (device.last_contact_at && isValid(parseISO(device.last_contact_at))) {
        const lastContactDate = parseISO(device.last_contact_at);
        const minutesSinceContact = Math.floor(
            (new Date().getTime() - lastContactDate.getTime()) / (1000 * 60)
        );
        
        if (minutesSinceContact <= 15) {
            status = 'online';
            statusBadgeVariant = 'default';
            statusIcon = CheckCircle;
        } else if (minutesSinceContact <= 30) {
            status = 'warning';
            statusBadgeVariant = 'secondary';
            statusIcon = AlertTriangle;
        }
        
        lastContactText = formatDistanceToNow(lastContactDate, { 
            addSuffix: true,
            locale
        });
    }

    const StatusIcon = statusIcon;

    const statusTooltipContent = {
        online: __('devices.status.online_tooltip') || 'Device has been active within the last 15 minutes',
        warning: __('devices.status.warning_tooltip') || 'Device has been inactive between 15-30 minutes',
        offline: __('devices.status.offline_tooltip') || 'Device has been inactive for more than 30 minutes'
    };

    return (
        <Card className="mb-4 overflow-hidden py-0" 
        >
            <CardContent className="p-0">
                <div className="flex flex-col">
                    {/* Header with status badge */}
                    <div className="flex flex-col items-center p-3 border-b">
                        <h3 className="text-base font-medium mb-2">{device.name}</h3>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant={statusBadgeVariant} className={cn(
                                        "flex items-center gap-1",
                                        status === 'online' && "bg-green-500",
                                        status === 'warning' && "bg-amber-500 text-amber-950"
                                    )}>
                                        <StatusIcon className="h-3 w-3" />
                                        <span>
                                            {status === 'online' 
                                                ? __('devices.status.online') 
                                                : status === 'warning' 
                                                ? __('devices.status.warning') 
                                                : __('devices.status.offline')}
                                        </span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {statusTooltipContent[status]}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    
                    {/* Device information in vertical layout */}
                    <div className="p-3 flex flex-col space-y-2">
                        {/* Device type */}
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-muted-foreground font-medium">
                                    {__('devices.fields.type')}
                                </span>
                                <span className="text-sm truncate">
                                    {device.type?.manufacturer ? (
                                        <>
                                            <span className="font-medium">{device.type.manufacturer}</span>
                                            {device.type.name && <span className="text-muted-foreground"> {device.type.name}</span>}
                                        </>
                                    ) : (
                                        __('common.not_set')
                                    )}
                                </span>
                            </div>
                        </div>
                        
                        {/* IMEI number */}
                        <div className="flex items-center gap-2">
                            <Signal className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-muted-foreground font-medium">
                                    {__('devices.fields.imei')}
                                </span>
                                <span className="text-sm font-mono truncate">
                                    {device.imei || __('common.not_set')}
                                </span>
                            </div>
                        </div>
                        
                        {/* Last contact time */}
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-muted-foreground font-medium">
                                    {__('devices.fields.last_contact')}
                                </span>
                                <span className={cn("text-sm truncate", 
                                    status === 'offline' && "text-destructive",
                                    status === 'warning' && "text-amber-500"
                                )}>
                                    {lastContactText}
                                </span>
                            </div>
                        </div>
                        
                        {/* Vehicle information if available */}
                        {device.vehicle && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <div className="flex-1 flex items-center justify-center">
                                    <Link href={route('vehicles.show', device.vehicle.id)}>
                                        <LicensePlate registration={device.vehicle.registration} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DevicesLayout({ children, showSidebar = false, device }: DevicesLayoutProps) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const sidebarNavItems: DeviceNavItem[] = [
        {
            title: __('devices.tabs.information'),
            href: device ? route('devices.show', device.id) : '',
            icon: Info,
            active: device ? route().current("devices.show", { device: device.id }) : false,
        },
    ];

    if (device) {
        sidebarNavItems.push({
            title: __('devices.messages.title'),
            href: route('devices.messages.index', device.id),
            icon: MessageSquare,
            active: route().current("devices.messages.index", { device: device.id }),
        });
        sidebarNavItems.push({
            title: __("devices.datapoints.title"),
            href: route("devices.datapoints.index", { device: device.id }),
            icon: ChartBar,
            active: route().current("devices.datapoints.index", { device: device.id }),
        });
    }

    if (device) {
        if (device.type?.manufacturer === 'Teltonika') {
            sidebarNavItems.push({
                title: __('devices.tabs.config'),
                href: 'https://fota.teltonika.lt/devices?selected=' + device.imei,
                icon: Cog,
                external: true,
            });
        }
    }

    return (
        <div className="px-4 py-6">
            <Heading title={__('devices.list.heading')} description={__('devices.list.description')} />
            {showSidebar && device ? (
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="w-full max-w-xl lg:w-48">
                        {/* Device summary above sidebar */}
                        {device && <DeviceSummary device={device} />}
                        
                        <nav className="flex flex-col space-y-1 space-x-0">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('w-full justify-start', {
                                            'bg-muted': item.href.endsWith(currentPath),
                                        })}
                                    >
                                        {item.external ? (
                                            <a href={item.href} target="_blank" className="flex items-center px-3 py-2 w-full">
                                                {Icon && <Icon className="mr-2 h-4 w-4" />}
                                                {item.title}
                                            </a>
                                        ) : (
                                        <Link href={item.href} prefetch>
                                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>)}
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
