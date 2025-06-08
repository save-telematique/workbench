import { AlertResource } from "@/types";
import { useTranslation } from "@/utils/translation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Clock,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: AlertResource;
  onToggleRead?: (alert: AlertResource) => void;
  className?: string;
}

interface AlertLink {
  url: string;
  text: string;
  external?: boolean;
}

interface AlertMetadata {
  links?: AlertLink[];
  image?: string;
  [key: string]: unknown;
}

export default function AlertCard({ alert, onToggleRead, className }: AlertCardProps) {
  const { __ } = useTranslation();
  const [isToggling, setIsToggling] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'info':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'outline';
    }
  };

  const handleToggleRead = async () => {
    if (!onToggleRead || isToggling) return;
    
    setIsToggling(true);
    try {
      const endpoint = alert.is_read 
        ? route('alerts.mark-unread', { alert: alert.id })
        : route('alerts.mark-read', { alert: alert.id });
      
      await router.patch(endpoint, {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          onToggleRead(alert);
        }
      });
    } catch (error) {
      console.error('Error toggling alert read status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const renderContent = () => {
    if (typeof alert.content === 'string') {
      return <p className="text-sm text-muted-foreground">{alert.content}</p>;
    }
    
    // Handle complex content - convert to JSON string for display
    return (
      <div className="text-sm text-muted-foreground">
        <pre className="whitespace-pre-wrap">{JSON.stringify(alert.content, null, 2)}</pre>
      </div>
    );
  };

  const renderMetadata = () => {
    if (!alert.metadata || Object.keys(alert.metadata).length === 0) {
      return null;
    }

    const metadata = alert.metadata as AlertMetadata;

    return (
      <div className="mt-3 space-y-2">
        {metadata.links && Array.isArray(metadata.links) && (
          <div className="flex flex-wrap gap-2">
            {metadata.links.map((link: AlertLink, index: number) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                asChild
              >
                <a 
                  href={link.url} 
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                >
                  {link.text}
                </a>
              </Button>
            ))}
          </div>
        )}
        
        {metadata.image && typeof metadata.image === 'string' && (
          <img 
            src={metadata.image} 
            alt="Alert image" 
            className="max-w-full h-auto rounded-md"
          />
        )}
      </div>
    );
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-sm",
      !alert.is_read && "border-l-4 border-l-primary bg-primary/5",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              "flex items-center justify-center rounded-full p-1.5",
              alert.severity === 'error' && "bg-destructive/10 text-destructive",
              alert.severity === 'warning' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
              alert.severity === 'success' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
              alert.severity === 'info' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            )}>
              {getSeverityIcon(alert.severity)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{alert.title}</h3>
                                 <Badge variant={getSeverityColor(alert.severity) as "destructive" | "secondary" | "default" | "outline"} className="text-xs">
                  {__(`alerts.severity.${alert.severity}`)}
                </Badge>
                {!alert.is_read && (
                  <Badge variant="default" className="text-xs">
                    {__('alerts.status.unread')}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {alert.created_by && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{alert.created_by.name}</span>
                  </div>
                )}
                
                {alert.type && (
                  <Badge variant="outline" className="text-xs">
                    {__(`alerts.types.${alert.type}`)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {onToggleRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleRead}
              disabled={isToggling}
              className="h-8 w-8 p-0"
            >
              {alert.is_read ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {alert.is_read ? __('alerts.actions.mark_unread') : __('alerts.actions.mark_read')}
              </span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {renderContent()}
        {renderMetadata()}
      </CardContent>
    </Card>
  );
} 