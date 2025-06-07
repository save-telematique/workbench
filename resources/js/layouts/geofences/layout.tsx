import { ReactNode } from 'react';
import { GeofenceResource } from '@/types/resources';

interface GeofencesLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    geofence?: GeofenceResource; // Keep for compatibility but won't use
}

export default function GeofencesLayout({ children }: GeofencesLayoutProps) {
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <div>{children}</div>
        </div>
    );
} 