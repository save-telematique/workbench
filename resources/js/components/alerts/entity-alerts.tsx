import { useState, useEffect } from "react";
import { AlertResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { usePermission } from "@/utils/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Filter, 
  Eye, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { router } from "@inertiajs/react";
import AlertCard from "./alert-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntityAlertsProps {
  entityType: 'vehicle' | 'driver' | 'device' | 'user';
  entityId: string | number;
  entityName?: string;
  initialAlerts?: AlertResource[];
  className?: string;
}

export default function EntityAlerts({ 
  entityType, 
  entityId, 
  entityName, 
  initialAlerts = [],
  className 
}: EntityAlertsProps) {
  const { __ } = useTranslation();
  const canViewAlerts = usePermission('view_alerts');
  
  const [alerts, setAlerts] = useState<AlertResource[]>(initialAlerts);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  // Load alerts for the entity
  const loadAlerts = async () => {
    if (!canViewAlerts) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        route('api.alerts.for-entity', { 
          type: entityType, 
          id: entityId,
          status: filter !== 'all' ? filter : undefined,
          severity: severityFilter !== 'all' ? severityFilter : undefined
        }),
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load alerts when filters change
  useEffect(() => {
    if (initialAlerts.length === 0) {
      loadAlerts();
    }
  }, [filter, severityFilter, entityType, entityId]);

  // Handle alert read/unread toggle
  const handleToggleRead = (toggledAlert: AlertResource) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === toggledAlert.id 
          ? { ...alert, is_read: !alert.is_read, read_at: !alert.is_read ? new Date().toISOString() : null }
          : alert
      )
    );
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const unreadAlerts = alerts.filter(alert => !alert.is_read);
    if (unreadAlerts.length === 0) return;

    try {
      for (const alert of unreadAlerts) {
        await router.patch(route('alerts.mark-read', { alert: alert.id }), {}, {
          preserveScroll: true,
          preserveState: true,
        });
      }
      
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => ({ 
          ...alert, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'read' && !alert.is_read) return false;
    if (filter === 'unread' && alert.is_read) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  if (!canViewAlerts) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">
              {__('alerts.entity.title')}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filters */}
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            <Select value={filter} onValueChange={(value: 'all' | 'unread' | 'read') => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{__('alerts.filters.all')}</SelectItem>
                <SelectItem value="unread">{__('alerts.filters.unread')}</SelectItem>
                <SelectItem value="read">{__('alerts.filters.read')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={(value: 'all' | 'info' | 'warning' | 'error' | 'success') => setSeverityFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{__('alerts.filters.all_severities')}</SelectItem>
                <SelectItem value="info">{__('alerts.severity.info')}</SelectItem>
                <SelectItem value="warning">{__('alerts.severity.warning')}</SelectItem>
                <SelectItem value="error">{__('alerts.severity.error')}</SelectItem>
                <SelectItem value="success">{__('alerts.severity.success')}</SelectItem>
              </SelectContent>
            </Select>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <Eye className="mr-1 h-3 w-3" />
                {__('alerts.actions.mark_all_read')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {__('alerts.loading')}
            </span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium text-sm">
              {filter === 'all' ? __('alerts.entity.no_alerts') : __('alerts.entity.no_filtered_alerts')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === 'all' 
                ? __('alerts.entity.no_alerts_description', { entity: entityName || entityType })
                : __('alerts.entity.try_different_filters')
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggleRead={handleToggleRead}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 