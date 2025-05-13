import React, { useEffect, useState, useRef, forwardRef } from "react";
import Map, { 
    NavigationControl, 
    MapRef, 
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "@/utils/translation";
import { cn } from "@/lib/utils";
import { 
    Map as MapIcon, 
    Maximize2, 
    Minimize2, 
    RefreshCw,
    LocateFixed, 
    Circle,
    CheckCircle2,
    Car,
    Truck,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BBox } from "geojson";
import { Badge } from "@/components/ui/badge";
import { VehicleResource, ActivityResource } from "@/types";

// Vehicle type mapping by ID with corresponding icons
export const vehicleTypes = {
    1: { icon: Truck, label: "truck" },           // Camion/Truck
    2: { icon: Package, label: "trailer" },       // Remorque/Trailer
    3: { icon: Car, label: "car" },               // Voiture/Car
    default: { icon: Car, label: "unknown" },     // Default - Car
};

// Activity color mapping - different colors for different activities
export const activityColors = {
    0: { color: "#2563eb", label: "rest" },        // Repos (0) - Blue
    1: { color: "#8b5cf6", label: "available" },   // Disponibilité (1) - Purple
    2: { color: "#ea580c", label: "work" },        // Travail (2) - Orange
    3: { color: "#16a34a", label: "driving" },     // Conduite (3) - Green
    100: { color: "#4b5563", label: "removed_card" }, // Carte retirée (100) - Gray
    default: { color: "#4b5563", label: "unknown" },  // Default - Gray
};

// Get vehicle icon component based on vehicle type ID
export const getVehicleTypeIcon = (vehicle: VehicleResource) => {
    if (!vehicle.type) return vehicleTypes.default.icon;
    return vehicleTypes[vehicle.type.id as keyof typeof vehicleTypes]?.icon || vehicleTypes.default.icon;
};

// Get color based on activity ID
export const getActivityColor = (activity: ActivityResource | undefined): string => {
    if (!activity) return activityColors.default.color;
    
    const activityId = activity.id;
    return activityColors[activityId as keyof typeof activityColors]?.color || activityColors.default.color;
};

// Vehicle icon component to display different vehicles based on type
export const VehicleIcon = ({ 
    vehicle, 
    size = 30, // Smaller default size for more subtle look
    isSelected = false,
    onClick 
}: { 
    vehicle: VehicleResource; 
    size?: number;
    isSelected?: boolean;
    onClick?: () => void;
}) => {
    // Get activity color from current working session
    const activity = vehicle.current_working_session?.activity;
    const activityColor = getActivityColor(activity);
    
    // Determine the icon based on vehicle type ID
    const IconComponent = getVehicleTypeIcon(vehicle);
    
    // Determine status color
    const statusColor = vehicle.current_location?.moving 
        ? "#16a34a" // Moving - green
        : vehicle.current_location?.ignition 
            ? "#f59e0b" // Idling - amber
            : "#6b7280"; // Parked - gray
    
    // Get heading for the direction arrow
    const isMoving = vehicle.current_location?.moving;
    const heading = vehicle.current_location?.heading || 0;

    return (
        <div 
            className="relative group transition-all duration-300 ease-in-out cursor-pointer"
            onClick={onClick}
        >
            {/* Activity ring (always present) */}
            <div 
                className={cn(
                    "absolute rounded-full opacity-70 z-10",
                    isSelected && "ring-2 ring-offset-2 ring-primary ring-offset-background"
                )}
                style={{ 
                    width: size * 1.4, 
                    height: size * 1.4, 
                    backgroundColor: activityColor,
                    top: -size * 0.2,
                    left: -size * 0.2,
                    boxShadow: `0 0 10px rgba(0,0,0,0.1)`
                }} 
            />
            
            {/* Direction arrow for moving vehicles - positioned outside the circle */}
            {(isMoving || heading !== 0) && (
                <div className="absolute" style={{ 
                    width: 0, 
                    height: 0,
                    zIndex: 6,
                    // Calculate position on the edge of the circle
                    top: size * 0.5 - Math.sin((90 - heading) * Math.PI / 180) * size * 0.8,
                    left: size * 0.5 + Math.cos((90 - heading) * Math.PI / 180) * size * 0.8,
                    
                }}>
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        style={{ 
                            transform: `rotate(${heading - 90}deg)`,
                            transformOrigin: 'center',
                            position: 'absolute',
                            opacity: 0.7,
                            top: -10,
                            left: -8
                        }}
                    >
                        <path 
                            d="M5 12h14M12 5l7 7-7 7" 
                            stroke={activityColor} 
                            strokeWidth="6" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            )}
            
            {/* Status circle with centered icon (inside activity ring) */}
            <div 
                className="absolute rounded-full opacity-90 z-20 flex items-center justify-center"
                style={{ 
                    width: size, 
                    height: size, 
                    backgroundColor: statusColor,
                    top: 0,
                    left: 0,
                    boxShadow: `0 0 6px rgba(0,0,0,0.2)`
                }} 
            >
                {/* Icon centered within status circle */}
                <IconComponent 
                    size={size * 0.6} 
                    className="text-white drop-shadow-sm"
                    strokeWidth={1.5}
                />
            </div>
            
            {/* Pulse animation for moving vehicles */}
            {isMoving && (
                <div 
                    className="absolute animate-ping opacity-20 rounded-full bg-green-500 z-0" 
                    style={{ 
                        width: size * 1.4, 
                        height: size * 1.4,
                        top: -size * 0.2,
                        left: -size * 0.2
                    }}
                />
            )}
        </div>
    );
};

// View state interface for better typing
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  transitionDuration?: number;
}

export interface BaseMapProps {
    className?: string;
    initialRefreshInterval?: number; // in seconds
    showFullscreenOption?: boolean;
    showRefreshButton?: boolean;
    showResetViewButton?: boolean;
    showStyleSelector?: boolean;
    showLegendToggle?: boolean;
    initialStyle?: string;
    initialShowLegend?: boolean;
    children?: React.ReactNode;
    onMapLoad?: () => void;
    onRefresh?: () => void;
    onBoundsChange?: (bounds: BBox) => void;
    onViewStateChange?: (viewState: ViewState) => void;
    height?: string;
    stats?: React.ReactNode; // Optional stats for info panel
    showInfoPanel?: boolean; // Whether to show the info panel
    lastRefresh?: Date; // Date of last refresh, used in InfoPanel
    // Additional view state props
    longitude?: number;
    latitude?: number;
    zoom?: number;
    bearing?: number;
    pitch?: number;
}

// Styling for mapbox - light and dark themes
export const mapStyles = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    navigation: 'mapbox://styles/mapbox/navigation-day-v1',
};

const BaseMap = forwardRef<MapRef, BaseMapProps>(({ 
    className, 
    initialRefreshInterval = 60,
    showFullscreenOption = true,
    showRefreshButton = true,
    showResetViewButton = true,
    showStyleSelector = true,
    showLegendToggle = false,
    initialStyle = mapStyles.streets,
    initialShowLegend = true,
    children,
    onMapLoad,
    onRefresh,
    onBoundsChange,
    onViewStateChange,
    height = "400px",
    stats,
    showInfoPanel = true,
    lastRefresh: externalLastRefresh,
    // Handle external view state props if provided
    longitude,
    latitude,
    zoom,
    bearing,
    pitch,
}, ref) => {
    const { __ } = useTranslation();
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const mapRef = useRef<MapRef>(null);
    
    // Component state
    const [loading, setLoading] = useState<boolean>(false);
    const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
    const [mapStyle, setMapStyle] = useState<string>(initialStyle);
    const [refreshInterval, setRefreshInterval] = useState<number>(initialRefreshInterval);
    const [internalLastRefresh, setInternalLastRefresh] = useState<Date>(new Date());
    const [showLegend, setShowLegend] = useState<boolean>(initialShowLegend);
    const [bounds, setBounds] = useState<BBox | null>(null);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    
    // Use external lastRefresh if provided, otherwise use internal
    const lastRefresh = externalLastRefresh || internalLastRefresh;
    
    // View state for the map - use provided props or defaults
    const [viewState, setViewState] = useState<ViewState>({
        longitude: longitude ?? 2.3522, // Default to center of France
        latitude: latitude ?? 46.2276,
        zoom: zoom ?? 5,
        bearing: bearing ?? 0,
        pitch: pitch ?? 0,
    });

    // Update viewState when props change
    useEffect(() => {
        if (longitude !== undefined && latitude !== undefined) {
            setViewState(prev => ({
                ...prev,
                longitude,
                latitude,
                zoom: zoom ?? prev.zoom,
                bearing: bearing ?? prev.bearing,
                pitch: pitch ?? prev.pitch
            }));
        }
    }, [longitude, latitude, zoom, bearing, pitch]);

    // Expose the map ref to parent components if needed
    useEffect(() => {
        if (ref && typeof ref === 'function') {
            if (mapRef.current) {
                ref(mapRef.current);
            }
        } else if (ref && mapRef.current) {
            ref.current = mapRef.current;
        }
    }, [ref, mapRef.current]);

    // Handler for when the map is loaded
    const handleMapLoad = () => {
        setMapLoaded(true);
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            if (map) {
                // Set initial bounds
                const mapBounds = map.getBounds();
                if (mapBounds) {
                    const bbox: BBox = [
                        mapBounds.getWest(),
                        mapBounds.getSouth(),
                        mapBounds.getEast(),
                        mapBounds.getNorth()
                    ];
                    setBounds(bbox);
                    if (onBoundsChange) {
                        onBoundsChange(bbox);
                    }
                }
            }
        }
        if (onMapLoad) {
            onMapLoad();
        }
    };

    // Get map bounds
    useEffect(() => {
        if (mapRef.current && mapLoaded) {
            const map = mapRef.current.getMap();
            if (map) {
                const mapBounds = map.getBounds();
                if (mapBounds) {
                    const bbox: BBox = [
                        mapBounds.getWest(),
                        mapBounds.getSouth(),
                        mapBounds.getEast(),
                        mapBounds.getNorth()
                    ];
                    setBounds(bbox);
                    if (onBoundsChange) {
                        onBoundsChange(bbox);
                    }
                }
            }
        }
    }, [viewState, mapLoaded, onBoundsChange]);

    // Handle view state change
    const handleViewStateChange = (evt: { viewState: ViewState }) => {
        setViewState(evt.viewState);
        if (onViewStateChange) {
            onViewStateChange(evt.viewState);
        }
    };

    // Manual refresh handler
    const handleRefresh = () => {
        setLoading(true);
        setInternalLastRefresh(new Date());
        if (onRefresh) {
            onRefresh();
        }
        setLoading(false);
    };

    // Handle interval change
    const handleIntervalChange = (interval: number) => {
        setRefreshInterval(interval);
    };

    // Map content to render
    const mapContent = (
        <div 
            className={cn(
                "relative", 
                showFullscreen 
                    ? "fixed inset-0 z-50 p-4 bg-background" 
                    : `h-[${height}] rounded-md overflow-hidden`
            )}
        >
            <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                {showRefreshButton && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 shadow-sm border-border/40 backdrop-blur-sm" 
                                    onClick={handleRefresh}
                                    disabled={loading}
                                >
                                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {__("vehicles.map.refresh")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                {showResetViewButton && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 shadow-sm border-border/40 backdrop-blur-sm" 
                                    onClick={() => {
                                        // Reset view callback would be implemented by the parent component
                                        if (onViewStateChange) {
                                            onViewStateChange({
                                                ...viewState,
                                                zoom: 5,
                                            });
                                        }
                                    }}
                                >
                                    <LocateFixed className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {__("vehicles.map.reset_view")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                {showLegendToggle && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 shadow-sm border-border/40 backdrop-blur-sm" 
                                    onClick={() => setShowLegend(!showLegend)}
                                >
                                    <Circle className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {showLegend ? __("vehicles.map.hide_legend") : __("vehicles.map.show_legend")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                {showStyleSelector && (
                    <DropdownMenu>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-7 w-7 shadow-sm border-border/40 backdrop-blur-sm"
                                        >
                                            <MapIcon className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    {__("vehicles.map.change_style")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setMapStyle(mapStyles.streets)}>
                                {mapStyle === mapStyles.streets && <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {__("vehicles.map.style_streets")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMapStyle(mapStyles.light)}>
                                {mapStyle === mapStyles.light && <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {__("vehicles.map.style_light")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMapStyle(mapStyles.dark)}>
                                {mapStyle === mapStyles.dark && <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {__("vehicles.map.style_dark")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMapStyle(mapStyles.satellite)}>
                                {mapStyle === mapStyles.satellite && <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {__("vehicles.map.style_satellite")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                
                {showFullscreenOption && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 shadow-sm border-border/40 backdrop-blur-sm" 
                                    onClick={() => setShowFullscreen(!showFullscreen)}
                                >
                                    {showFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {showFullscreen ? __("vehicles.map.exit_fullscreen") : __("vehicles.map.fullscreen")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            
            <Map
                {...viewState}
                ref={mapRef}
                onMove={handleViewStateChange}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxToken}
                style={{ width: "100%", height: "100%" }}
                maxZoom={20}
                onLoad={handleMapLoad}
            >
                {/* Pass children to render markers, popups, etc. */}
                {mapLoaded && bounds && children}
                
                <NavigationControl position="bottom-right" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }} />
            </Map>
            
            {/* Info panel in fullscreen mode */}
            {showFullscreen && showInfoPanel && (
                <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-background/80 p-2 rounded-md shadow-md backdrop-blur-sm border border-border/30 flex items-center gap-2 text-xs flex-wrap">
                        {stats}
                        
                        <Badge variant="outline" className="text-xs bg-background/50">
                            {__("vehicles.map.last_updated")}: {formatDate(lastRefresh, 'TIME')}
                        </Badge>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 text-xs bg-background/70 border-border/40">
                                    {refreshInterval}s <span className="ml-1">{__("vehicles.map.refresh")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleIntervalChange(15)}>
                                    {refreshInterval === 15 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    15s
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleIntervalChange(30)}>
                                    {refreshInterval === 30 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    30s
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleIntervalChange(60)}>
                                    {refreshInterval === 60 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    60s
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleIntervalChange(300)}>
                                    {refreshInterval === 300 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    5m
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
        </div>
    );

    // If in fullscreen mode, return just the map content
    if (showFullscreen) {
        return mapContent;
    }
    
    // Otherwise return map content with the provided className
    return (
        <div className={className}>
            {mapContent}
            
            {/* Bottom info panel for non-fullscreen view */}
            {!showFullscreen && showInfoPanel && (
                <div className="mt-2 p-2">
                    <div className="text-xs text-left text-muted-foreground">
                        {__("vehicles.map.last_updated")}: {formatDate(lastRefresh, 'TIME')} 
                        {refreshInterval && (
                            <>
                                <span className="mx-1">•</span> 
                                {__("vehicles.map.auto_refresh")}: {refreshInterval}s
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default BaseMap;