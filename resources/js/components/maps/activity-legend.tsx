import React from "react";
import { useTranslation } from "@/utils/translation";
import { Map as MapIcon } from "lucide-react";
import { activityColors, vehicleTypes } from "@/components/maps/base-map";

interface ActivityLegendProps {
    position?: "top-left" | "bottom-right";
    compact?: boolean;
    onClose?: () => void;
}

// Status colors for the legend
const statusColors = {
    moving: "#16a34a", // Green
    idling: "#f59e0b", // Amber
    parked: "#6b7280", // Gray
};

// Status names in French with correct capitalization
const statusNames = {
    moving: "En mouvement",
    idling: "Moteur allumé",
    parked: "Moteur éteint",
};

export const ActivityLegend: React.FC<ActivityLegendProps> = ({ 
    position = "top-left",
    compact = false,
    // onClose prop is defined but not used currently
}) => {
    const { __ } = useTranslation();
    
    const positionClasses = {
        "top-left": "top-2 left-2",
        "bottom-right": "bottom-4 right-4"
    };
    
    return (
        <div className={`absolute ${positionClasses[position]} p-3 rounded-md shadow-md z-10 max-w-xs bg-background/90 border border-border/30 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center">
                    <MapIcon className="h-3.5 w-3.5 mr-1.5" />
                    {__("vehicles.map.legend_title", { fallback: "Légende" })}
                </h4>
            </div>
            
            {/* Activity colors section */}
            <div className="mb-3">
                <h5 className="text-xs font-medium mb-2">{__("vehicles.map.activity_legend", { fallback: "Activités" })}</h5>
                <div className={compact ? "flex flex-wrap gap-x-3 gap-y-2" : "grid grid-cols-2 gap-2"}>
                    {Object.entries(activityColors).map(([id, { color, label }]) => {
                        // Skip default entry
                        if (id === 'default') return null;
                        
                        return (
                            <div key={id} className="flex items-center gap-2 text-xs">
                                <div className="relative flex-shrink-0">
                                    {/* Outer circle (activity) */}
                                    <div 
                                        className="w-5 h-5 rounded-full opacity-70"
                                        style={{ backgroundColor: color }}
                                    />
                                    {/* Inner dot indicator */}
                                    <div 
                                        className="absolute w-3 h-3 rounded-full top-1 left-1"
                                        style={{ backgroundColor: statusColors.parked }}
                                    />
                                </div>
                                <span className="text-muted-foreground">
                                    {__(`vehicles.activity.${label}`, { 
                                        fallback: id === '0' ? "Repos" :
                                                id === '1' ? "Disponibilité" :
                                                id === '2' ? "Travail" :
                                                id === '3' ? "Conduite" :
                                                id === '100' ? "Carte retirée" : label
                                    })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Vehicle status section */}
            <div>
                <h5 className="text-xs font-medium mb-2">{__("vehicles.status.title", { fallback: "Statut" })}</h5>
                <div className={compact ? "flex flex-wrap gap-x-3 gap-y-2" : "grid grid-cols-2 gap-2"}>
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2 text-xs">
                            <div className="relative flex-shrink-0">
                                {/* Outer circle (using a neutral activity color) */}
                                <div 
                                    className="w-5 h-5 rounded-full opacity-70"
                                    style={{ backgroundColor: activityColors['default'].color }}
                                />
                                {/* Inner status indicator */}
                                <div 
                                    className="absolute w-3 h-3 rounded-full top-1 left-1"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                            <span className="text-muted-foreground">
                                {statusNames[status as keyof typeof statusNames] || __(`vehicles.status.${status}`, { fallback: status })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Vehicle types section (all types) */}
            <div className="mt-3">
                <h5 className="text-xs font-medium mb-2">{__("vehicles.types.title", { fallback: "Types de véhicules" })}</h5>
                <div className={compact ? "flex flex-wrap gap-x-3 gap-y-2" : "grid grid-cols-2 gap-2"}>
                    {Object.entries(vehicleTypes).map(([id, { icon: Icon, label }]) => {
                        // Skip default entry
                        if (id === 'default') return null;
                        
                        return (
                            <div key={id} className="flex items-center gap-2 text-xs">
                                <div className="relative flex-shrink-0">
                                    <div className="w-5 h-5 rounded-full opacity-90 flex items-center justify-center"
                                        style={{ backgroundColor: statusColors.parked }}>
                                        <Icon size={10} className="text-white" />
                                    </div>
                                </div>
                                <span className="text-muted-foreground">
                                    {__(`vehicles.types.${label}`)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}; 