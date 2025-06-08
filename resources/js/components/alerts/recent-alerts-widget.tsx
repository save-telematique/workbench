import React from 'react';
import { AlertResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Eye,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RecentAlertsWidgetProps {
  alerts: AlertResource[];
  className?: string;
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

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'secondary';
    default:
      return 'default';
  }
};

export default function RecentAlertsWidget({ alerts, className }: RecentAlertsWidgetProps) {
  const { __ } = useTranslation();

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">
            {__('alerts.title')}
          </CardTitle>
          <CardDescription>
            {__('dashboard.widgets.recent_alerts_description')}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {__('alerts.unread_count', { count: unreadCount })}
            </Badge>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href={route('alerts.index')}>
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">{__('alerts.actions.view_all')}</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{__('alerts.empty_state.description')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity);
              
              return (
                <div 
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <SeverityIcon className={cn(
                    "h-4 w-4 mt-0.5 flex-shrink-0",
                    getSeverityColor(alert.severity)
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={route('alerts.show', { alert: alert.id })}
                        className="text-sm font-medium hover:underline line-clamp-1"
                      >
                        {alert.title}
                      </Link>
                      
                      {!alert.is_read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <Badge 
                        variant={getSeverityVariant(alert.severity) as "destructive" | "secondary" | "default"}
                        className="text-xs"
                      >
                        {__(`alerts.severity.${alert.severity}`)}
                      </Badge>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {typeof alert.content === 'string' && alert.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.content}
                      </p>
                    )}
                  </div>
                  
                  <Button asChild variant="ghost" size="sm" className="flex-shrink-0">
                    <Link href={route('alerts.show', { alert: alert.id })}>
                      <Eye className="h-3 w-3" />
                      <span className="sr-only">{__('common.view')}</span>
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        
        {alerts.length > 0 && (
          <div className="pt-2 border-t">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={route('alerts.index')}>
                {__('alerts.actions.view_all')}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 