import { useState, useEffect } from 'react';
import { usePermission } from '@/utils/permissions';

export function useUnreadAlertsCount() {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const canViewAlerts = usePermission('view_alerts');

    const fetchUnreadCount = async () => {
        if (!canViewAlerts) {
            setUnreadCount(0);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(route('api.alerts.unread-count'), {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread alerts count:', error);
            setUnreadCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        
        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, [canViewAlerts]);

    return {
        unreadCount,
        isLoading,
        refetch: fetchUnreadCount
    };
} 