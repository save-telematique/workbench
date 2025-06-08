import { type ColumnDef } from '@tanstack/react-table';
import { AlertResource } from '@/types';
import { useTranslation } from '@/utils/translation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


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
      return 'default';
    case 'warning':
      return 'secondary';
    case 'error':
      return 'destructive';
    case 'success':
      return 'default';
    default:
      return 'default';
  }
};

export const useColumns = () => {
  const { __ } = useTranslation();

  const columns: ColumnDef<AlertResource>[] = [
    {
      accessorKey: 'title',
      header: 'alerts.fields.title',
      enableSorting: true,
      enableHiding: false,
      cell: ({ row }) => {
        const alert = row.original;
        const SeverityIcon = getSeverityIcon(alert.severity);
        
        return (
          <div className="flex items-center space-x-3">
            <SeverityIcon className={cn(
              "h-4 w-4",
              alert.severity === 'error' && "text-destructive",
              alert.severity === 'warning' && "text-amber-500",
              alert.severity === 'success' && "text-green-500",
              alert.severity === 'info' && "text-blue-500"
            )} />
            
            <div>
              <div className="font-medium">
                {alert.title}
                {!alert.is_read && (
                  <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full inline-block" />
                )}
              </div>
              
              {typeof alert.content === 'string' ? (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {alert.content}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {__('alerts.complex_content')}
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: 'severity',
      header: 'alerts.fields.severity',
      enableSorting: true,
      cell: ({ row }) => {
        const severity = row.getValue('severity') as string;
        
        return (
          <Badge variant={getSeverityColor(severity) as "destructive" | "secondary" | "default" | "outline"}>
            {__(`alerts.severity.${severity}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'alertable_type',
      header: 'alerts.fields.entity',
      enableSorting: false,
      cell: ({ row }) => {
        const alert = row.original;
        
        if (alert.alertable) {
          const entityType = alert.alertable_type.toLowerCase().replace('app\\models\\', '');
          let name = '';
          let href = '';
          
          switch (entityType) {
            case 'vehicle': {
              const vehicle = alert.alertable as { registration?: string };
              name = vehicle.registration || __('common.unknown');
              href = route('vehicles.show', { vehicle: alert.alertable_id });
              break;
            }
            case 'driver': {
              const driver = alert.alertable as { surname?: string; firstname?: string };
              name = `${driver.surname || ''} ${driver.firstname || ''}`.trim();
              href = route('drivers.show', { driver: alert.alertable_id });
              break;
            }
            case 'device': {
              const device = alert.alertable as { serial_number?: string };
              name = device.serial_number || __('common.unknown');
              href = route('devices.show', { device: alert.alertable_id });
              break;
            }
            default:
              name = __('common.unknown');
          }
          
          return href ? (
            <Link href={href} className="text-primary hover:underline">
              {name}
            </Link>
          ) : (
            <span>{name}</span>
          );
        }
        
        return (
          <span className="text-muted-foreground">
            {__('common.unknown')}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'common.created_at',
      enableSorting: true,
      cell: ({ row }) => {
        const createdAt = row.getValue('created_at') as string;
        
        return (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const alert = row.original;
        
        const handleMarkAsRead = () => {
          router.patch(route('alerts.mark-as-read', { alert: alert.id }));
        };
        
        const handleMarkAsUnread = () => {
          router.patch(route('alerts.mark-as-unread', { alert: alert.id }));
        };
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{__('common.open_menu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={route('alerts.show', { alert: alert.id })}>
                  <Eye className="mr-2 h-4 w-4" />
                  {__('common.view')}
                </Link>
              </DropdownMenuItem>
              
              {alert.is_read ? (
                <DropdownMenuItem onClick={handleMarkAsUnread}>
                  <Eye className="mr-2 h-4 w-4" />
                  {__('alerts.actions.mark_as_unread')}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleMarkAsRead}>
                  <Eye className="mr-2 h-4 w-4" />
                  {__('alerts.actions.mark_as_read')}
                </DropdownMenuItem>
              )}
              

            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return columns;
}; 