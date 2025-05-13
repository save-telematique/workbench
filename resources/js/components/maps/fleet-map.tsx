import React, { useEffect, useState, useRef } from "react";
import Map, { 
    Marker, 
    NavigationControl, 
    Popup, 
    MapRef, 
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "@/utils/translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    Map as MapIcon, 
    Car, 
    Truck, 
    Package, 
    AlertTriangle,
    LocateFixed, 
    Maximize2, 
    Minimize2, 
    RefreshCw,
    Circle,
    CheckCircle2,
    LayoutGrid,
    ChevronRight,
    Pencil,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format";
import { VehicleResource, ActivityResource } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "@inertiajs/react";
import useSupercluster from "use-supercluster";
import { BBox } from "geojson";
import { LicensePlate } from "../ui/license-plate";
import BaseMap, { 
    mapStyles,
    VehicleIcon,
    vehicleTypes,
    activityColors,
    getActivityColor,
    getVehicleTypeIcon
} from "@/components/maps/base-map";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FleetMapProps {
    className?: string;
    title?: string;
    initialRefreshInterval?: number; // in seconds
    showFullscreenOption?: boolean;
    vehicles: VehicleResource[];
    onVehicleClick?: (vehicle: VehicleResource) => void;
    onMarkerClick?: (vehicle: VehicleResource) => void;
    refreshVehicles?: () => void;
    showVehiclePanel?: boolean;
    initialSelectedVehicleId?: string;
    refreshInterval?: number;
}

// Activity color mapping - different colors for different activities
// const activityColors = {
//     0: { color: "#2563eb", label: "rest" },        // Repos (0) - Blue
//     1: { color: "#8b5cf6", label: "available" },   // Disponibilité (1) - Purple
//     2: { color: "#ea580c", label: "work" },        // Travail (2) - Orange
//     3: { color: "#16a34a", label: "driving" },     // Conduite (3) - Green
//     100: { color: "#4b5563", label: "removed_card" }, // Carte retirée (100) - Gray
//     default: { color: "#4b5563", label: "unknown" },  // Default - Gray
// };

// Vehicle type mapping by ID with corresponding icons
// const vehicleTypes = {
//     1: { icon: Truck, label: "truck" },           // Camion/Truck (ID 2)
const statusColors = {
    moving: "#16a34a", // Moving - green
    idling: "#f59e0b", // Idling - amber
    parked: "#6b7280", // Parked - gray
};

// Vehicle type mapping by ID with corresponding icons
const vehicleTypes = {
    1: { icon: Truck, label: "truck" },           // Camion/Truck (ID 2)
    2: { icon: Package, label: "trailer" },       // Remorque/Trailer (ID 3)
    3: { icon: Car, label: "car" },               // Voiture/Car (ID 1)
    default: { icon: Car, label: "unknown" },     // Default - Car
};

// Get vehicle icon component based on vehicle type ID
const getVehicleTypeIcon = (vehicle: VehicleResource) => {
    if (!vehicle.type) return vehicleTypes.default.icon;
    return vehicleTypes[vehicle.type.id as keyof typeof vehicleTypes]?.icon || vehicleTypes.default.icon;
};

// Get color based on activity ID
const getActivityColor = (activity: ActivityResource | undefined): string => {
    if (!activity) return activityColors.default.color;
    
    const activityId = activity.id;
    return activityColors[activityId as keyof typeof activityColors]?.color || activityColors.default.color;
};

// Vehicle icon component to display different vehicles based on type
const VehicleIcon = ({ 
    vehicle, 
    size = 30, // Smaller default size for more subtle look
    onClick 
}: { 
    vehicle: VehicleResource; 
    size?: number; 
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
                className="absolute rounded-full opacity-70 z-10"
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

// Status tag component for vehicles
const VehicleStatusTag = ({ vehicle }: { vehicle: VehicleResource }) => {
    const { __ } = useTranslation();
    const isMoving = vehicle.current_location?.moving;
    const hasIgnition = vehicle.current_location?.ignition;
    
    if (isMoving) {
        return (
            <Badge variant="outline" className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                {__("vehicles.status.moving")}
            </Badge>
        );
    } else if (hasIgnition) {
        return (
            <Badge variant="outline" className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                {__("vehicles.status.idling")}
            </Badge>
        );
    } else {
        return (
            <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                {__("vehicles.status.parked")}
            </Badge>
        );
    }
};

// Activity tag component
const ActivityTag = ({ vehicle }: { vehicle: VehicleResource }) => {
    const { __ } = useTranslation();
    const activity = vehicle.current_working_session?.activity;
    
    if (!activity) return null;
    
    // Get activity color from the imported activityColors
    const activityId = activity.id as keyof typeof activityColors;
    const activityData = activityColors[activityId] || activityColors.default;
    const colorHex = activityData.color;
    const labelKey = activityData.label;
    
    return (
        <Badge 
            variant="outline" 
            className="text-xs" 
            style={{ 
                backgroundColor: `${colorHex}20`, 
                borderColor: colorHex,
                color: colorHex
            }}
        >
            {__(`vehicles.activity.${labelKey}`)}
        </Badge>
    );
};

// Styling for mapbox - light and dark themes
const mapStyles = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    navigation: 'mapbox://styles/mapbox/navigation-day-v1',
};

// Activity legend component
const ActivityLegend = ({ 
    position = "top-left",
    compact = false
}: { 
    onClose?: () => void,
    position?: "top-left" | "bottom-right",
    compact?: boolean
}) => {
    const { __ } = useTranslation();
    
    const positionClasses = {
        "top-left": "top-2 left-2",
        "bottom-right": "bottom-4 right-4"
    };
    
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

// Define cluster properties interface for better type safety
interface ClusterProperties {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: number;
    vehicleId?: string;
    vehicle?: VehicleResource;
}

const FleetMap: React.FC<FleetMapProps> = ({ 
    className, 
    title = "fleet.title", 
    initialRefreshInterval = 60,
    showFullscreenOption = true,
    vehicles,
    onVehicleClick,
    onMarkerClick,
    refreshVehicles,
    showVehiclePanel = true,
    initialSelectedVehicleId,
    refreshInterval
}) => {
    const { __ } = useTranslation();
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const mapRef = useRef<MapRef>(null);
    
    // Component state
    const [vehiclesWithLocation, setVehiclesWithLocation] = useState<VehicleResource[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
        initialSelectedVehicleId || null
    );
    const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
    const [mapStyle, setMapStyle] = useState<string>(mapStyles.streets); // Default to streets style
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [showLegend, setShowLegend] = useState<boolean>(true);
    const [bounds, setBounds] = useState<BBox | null>(null);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    
    // View state for the map
    const [viewState, setViewState] = useState({
        longitude: 2.3522, // Default to center of France
        latitude: 46.2276,
        zoom: 5,
        bearing: 0,
        pitch: 0,
    });

    // Fetch vehicles data
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await fetch(route('vehicles.locations'));
            
            if (!response.ok) {
                throw new Error("Failed to fetch vehicle locations");
            }
            
            const data = await response.json();
            setVehiclesWithLocation(data || []);
            setLastRefresh(new Date());
            setError(null);
        } catch (err) {
            console.error('Error fetching vehicle locations:', err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Get vehicles with location data
    const vehiclesWithLocation = vehicles.filter(
        (vehicle) => vehicle.current_location && 
        vehicle.current_location.latitude && 
        vehicle.current_location.longitude
    );

    // Create GeoJSON for clustering
    const points = vehiclesWithLocation.map(vehicle => ({
        type: "Feature" as const,
        properties: {
            vehicleId: vehicle.id,
            vehicle: vehicle,
            cluster: false
        },
        geometry: {
            type: "Point" as const,
            coordinates: [
                vehicle.current_location?.longitude || 0,
                vehicle.current_location?.latitude || 0
            ]
        }
    }));

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
                }
                
                // Auto-fit to vehicle locations if available
                if (vehiclesWithLocation.length > 0) {
                    resetView();
                }
            }
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
                }
            }
        }
    }, [viewState, mapLoaded]);

    // SuperCluster hook
    const { clusters, supercluster } = useSupercluster({
        points,
        bounds: bounds || undefined,
        zoom: viewState.zoom,
        options: {
            radius: 60,
            maxZoom: 20
        }
    });

    // Setup initial fetch and refresh interval
    useEffect(() => {
        // Fetch data immediately
        fetchVehicles();
        
        // Set up interval for refreshing
        const intervalId = setInterval(fetchVehicles, refreshInterval * 1000);
        
        // Clean up on unmount
        return () => clearInterval(intervalId);
    }, [refreshInterval]);

    // Auto-fit map to show all vehicles when data changes
    useEffect(() => {
        if (vehiclesWithLocation.length > 0 && mapRef.current && mapLoaded) {
            resetView();
        }
    }, [vehiclesWithLocation.length, mapLoaded]);

    // Calculate bounds for the given vehicles
    const getBounds = (vehicles: VehicleResource[]) => {
        let minLat = Number.MAX_VALUE;
        let maxLat = -Number.MAX_VALUE;
        let minLng = Number.MAX_VALUE;
        let maxLng = -Number.MAX_VALUE;

        vehicles.forEach(vehicle => {
            if (vehicle.current_location) {
                const { latitude, longitude } = vehicle.current_location;
                minLat = Math.min(minLat, latitude);
                maxLat = Math.max(maxLat, latitude);
                minLng = Math.min(minLng, longitude);
                maxLng = Math.max(maxLng, longitude);
            }
        });

        return { minLat, maxLat, minLng, maxLng };
    };

    // Calculate view state based on bounds
    const calculateViewState = (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
        const centerLng = (bounds.minLng + bounds.maxLng) / 2;
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        
        const latDiff = bounds.maxLat - bounds.minLat;
        const lngDiff = bounds.maxLng - bounds.minLng;
        const maxDiff = Math.max(latDiff, lngDiff);
        
        let zoom = 10;
        if (maxDiff <= 0.01) zoom = 14;
        else if (maxDiff <= 0.05) zoom = 13;
        else if (maxDiff <= 0.1) zoom = 12;
        else if (maxDiff <= 0.5) zoom = 10;
        else if (maxDiff <= 1) zoom = 9;
        else if (maxDiff <= 5) zoom = 7;
        else zoom = 5;
        
        return { longitude: centerLng, latitude: centerLat, zoom };
    };

    // Manual refresh handler
    const handleRefresh = () => {
        fetchVehicles();
    };

    // Reset map view to fit all vehicles
    const resetView = () => {
        if (vehiclesWithLocation.length > 0) {
            const bounds = getBounds(vehiclesWithLocation);
            const { longitude, latitude, zoom } = calculateViewState(bounds);
            
            setViewState(prev => ({
                ...prev,
                longitude,
                latitude,
                zoom
            }));
        }
    };

    // Cluster marker component
    const ClusterMarker = ({ 
        longitude, 
        latitude, 
        pointCount, 
        clusterId 
    }: { 
        longitude: number, 
        latitude: number, 
        pointCount: number, 
        clusterId: number 
    }) => {
        // Determine size based on the point count
        const size = 30 + Math.min(pointCount / points.length * 50, 40);
        
        return (
            <Marker longitude={longitude} latitude={latitude} anchor="center">
                <div 
                    className="bg-blue-500 rounded-full flex items-center justify-center text-white font-medium shadow-md border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors"
                    style={{ 
                        width: size, 
                        height: size,
                    }}
                    onClick={() => {
                        // Get zoom level to expand this cluster
                        const expansionZoom = Math.min(
                            supercluster?.getClusterExpansionZoom(clusterId) || 0, 
                            20
                        );
                        
                        setViewport({
                            longitude,
                            latitude,
                            zoom: expansionZoom,
                            transitionDuration: 500,
                        });
                    }}
                >
                    {pointCount}
                </div>
            </Marker>
        );
    };

    // Set viewport with animation
    const setViewport = ({ 
        longitude, 
        latitude, 
        zoom, 
        transitionDuration = 0 
    }: { 
        longitude: number, 
        latitude: number, 
        zoom: number, 
        transitionDuration?: number 
    }) => {
        setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom,
            transitionDuration
        }));
    };

    // Map content to render
    const mapContent = (
        <div 
            className={cn(
                "relative", 
                showFullscreen 
                    ? "fixed inset-0 z-50 p-4 bg-background" 
                    : "h-[400px] rounded-md overflow-hidden"
            )}
        >
            <div className="absolute top-2 right-2 z-10 flex gap-1.5">
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
                
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 shadow-sm border-border/40 backdrop-blur-sm" 
                                onClick={resetView}
                            >
                                <LocateFixed className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                            {__("vehicles.map.reset_view")}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                
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

            {showLegend && <ActivityLegend position="top-left" />}
            
            <Map
                {...viewState}
                ref={mapRef}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxToken}
                style={{ width: "100%", height: "100%" }}
                maxZoom={20}
                onLoad={handleMapLoad}
            >
                {/* Render clustered and individual markers */}
                {mapLoaded && bounds && clusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    // Use proper type for cluster properties
                    const properties = cluster.properties as ClusterProperties;
                    const isCluster = properties.cluster;
                    const pointCount = properties.point_count;
                    
                    if (isCluster && pointCount) {
                        return (
                            <ClusterMarker 
                                key={`cluster-${cluster.id}`}
                                longitude={longitude}
                                latitude={latitude}
                                pointCount={pointCount}
                                clusterId={cluster.id as number}
                            />
                        );
                    }
                    
                    // Individual vehicle marker
                    const vehicle = properties.vehicle as VehicleResource;
                    return (
                        <Marker
                            key={`vehicle-${vehicle.id}`}
                            longitude={longitude}
                            latitude={latitude}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setSelectedVehicleId(vehicle.id);
                                if (onMarkerClick) {
                                    onMarkerClick(vehicle);
                                }
                            }}
                        >
                            <VehicleIcon 
                                vehicle={vehicle} 
                                onClick={() => setSelectedVehicleId(vehicle.id)}
                            />
                        </Marker>
                    );
                })}

                {/* Popup for selected vehicle */}
                {selectedVehicleId && vehiclesWithLocation.find(v => v.id === selectedVehicleId) && (
                    <Popup
                        longitude={vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location?.longitude || 0}
                        latitude={vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location?.latitude || 0}
                        anchor="bottom"
                        onClose={() => setSelectedVehicleId(null)}
                        closeOnClick={false}

                        className="z-20 p-0 -translate-y-2 translate-x-3.5"
                        maxWidth="300px"
                    >
                        <div className="p-3 max-w-xs relative bg-background rounded-md">
                            {/* Custom close button */}
                            <button 
                                className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-50"
                                onClick={() => setSelectedVehicleId(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                            
                            {/* Header with license plate */}
                            <div className="mb-3 pr-5">
                                <Link 
                                    href={route('vehicles.show', { vehicle: selectedVehicleId })} 
                                    className="block mb-2"
                                >
                                    <LicensePlate registration={vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.registration || ''} />
                                </Link>
                                <div className="text-xs text-muted-foreground">
                                    <span className="inline-flex items-center">
                                        {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.vehicle_model?.vehicle_brand?.name} {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.vehicle_model?.name}
                                        {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.type && (
                                            <span className="ml-1 text-muted-foreground/80">
                                                • {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.type.name}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            
                            {/* All status badges grouped together */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <VehicleStatusTag vehicle={vehiclesWithLocation.find(v => v.id === selectedVehicleId) || {} as VehicleResource} />
                                
                                <Badge variant="outline" className="text-xs">
                                    {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location?.speed} {__("vehicles.map.km_per_hour")}
                                </Badge>
                                
                                {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_driver && (
                                    <Badge variant="outline" className="text-xs">
                                        {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_driver.firstname} {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_driver.surname}
                                    </Badge>
                                )}
                                
                                {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_working_session?.activity && (
                                    <ActivityTag vehicle={vehiclesWithLocation.find(v => v.id === selectedVehicleId) || {} as VehicleResource} />
                                )}
                            </div>
                            
                            {/* Address if available */}
                            {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location?.address && (
                                <div className="flex items-start gap-2 text-xs mb-3 px-0.5 py-1.5 bg-muted/30 rounded-sm">
                                    <span className="flex-1 text-muted-foreground">{vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location.address}</span>
                                </div>
                            )}
                            
                            {/* Timestamp */}
                            <div className="text-xs text-muted-foreground opacity-75">
                                {vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location.recorded_at && 
                                  formatDate(vehiclesWithLocation.find(v => v.id === selectedVehicleId)?.current_location.recorded_at, 'PPp')}
                            </div>
                        </div>
                    </Popup>
                )}
                
                <NavigationControl position="bottom-right" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }} />
            </Map>
            
            {showFullscreen && (
                <div className="absolute bottom-4 left-4 bg-background/80 p-2 rounded-md shadow-md z-10 backdrop-blur-sm border border-border/30">
                    <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-background/50">
                            {vehiclesWithLocation.length} {__("vehicles.map.vehicles_on_map")}
                        </Badge>
                        
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
                                <DropdownMenuItem onClick={() => setRefreshInterval(15)}>
                                    {refreshInterval === 15 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    15s
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRefreshInterval(30)}>
                                    {refreshInterval === 30 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    30s
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRefreshInterval(60)}>
                                    {refreshInterval === 60 && <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                                    60s
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRefreshInterval(300)}>
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

    // If in fullscreen mode, render only the map
    if (showFullscreen) {
        return mapContent;
    }
    
    // Vehicle stats
    const movingVehicles = vehiclesWithLocation.filter(v => v.current_location?.moving).length;
    const idlingVehicles = vehiclesWithLocation.filter(v => !v.current_location?.moving && v.current_location?.ignition).length;
    const parkedVehicles = vehiclesWithLocation.filter(v => !v.current_location?.moving && !v.current_location?.ignition).length;
    
    // Count vehicles by activity
    const activitiesCounts = vehiclesWithLocation.reduce((acc, vehicle) => {
        const activityId = vehicle.current_working_session?.activity?.id;
        if (activityId !== undefined) {
            acc[activityId] = (acc[activityId] || 0) + 1;
        }
        return acc;
    }, {} as Record<number, number>);

    return (
        <Card className={cn("py-4", className)}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5" />
                        {__(title, { fallback: "Carte de la Flotte" })}
                        <Badge variant="outline">
                            {vehiclesWithLocation.length} {__("vehicles.map.vehicles", { fallback: "véhicules" })}
                        </Badge>
                    </div>
                    <div className="flex gap-1.5 text-xs font-normal">
                        {/* Status badges matching the legend */}
                        <Badge 
                            variant="outline" 
                            className="flex items-center gap-1.5"
                            style={{ 
                                color: "white", 
                                backgroundColor: statusColors.moving,
                                borderColor: "transparent"
                            }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            {movingVehicles} {__("vehicles.status.moving")}
                        </Badge>
                        
                        <Badge 
                            variant="outline" 
                            className="flex items-center gap-1.5"
                            style={{ 
                                color: "white", 
                                backgroundColor: statusColors.idling,
                                borderColor: "transparent"
                            }}
                        >
                            <span className="h-2 w-2 rounded-full bg-white"></span>
                            {idlingVehicles} {__("vehicles.status.idling")}
                        </Badge>
                        
                        <Badge 
                            variant="outline" 
                            className="flex items-center gap-1.5"
                            style={{ 
                                color: "white", 
                                backgroundColor: statusColors.parked,
                                borderColor: "transparent"  
                            }}
                        >
                            <span className="h-2 w-2 rounded-full bg-white"></span>
                            {parkedVehicles} {__("vehicles.status.parked")}
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
                        <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
                        <h3 className="text-lg font-medium">{__("common.error")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {__("common.retry")}
                        </Button>
                    </div>
                ) : vehiclesWithLocation.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
                        <MapIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">{__("vehicles.messages.no_vehicles_with_location")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {__("vehicles.messages.no_vehicle_locations_available")}
                        </p>
                    </div>
                ) : (
                    mapContent
                )}
                
                {!showFullscreen && (
                    <div className="mt-2 p-2 flex flex-wrap gap-4 justify-between">
                        <div className="text-xs text-left text-muted-foreground">
                            {__("vehicles.map.last_updated", { fallback: "Dernière mise à jour" })}: {formatDate(lastRefresh, 'TIME')} 
                            <span className="mx-1">•</span> 
                            {__("vehicles.map.auto_refresh", { fallback: "Rafraîchissement auto" })}: {refreshInterval}s
                        </div>
                        
                        {/* Activity legend for non-fullscreen view */}
                        <div className="flex flex-wrap gap-2 text-xs">
                            {Object.entries(activityColors).map(([key, { color, label }]) => {
                                // Skip default entry
                                if (key === 'default') return null;
                                
                                const activityId = parseInt(key);
                                const count = activitiesCounts[activityId] || 0;
                                
                                if (count === 0) return null;
                                
                                // Get fallback values based on activity ID
                                const fallbackText = 
                                    key === '0' ? "Repos" :
                                    key === '1' ? "Disponibilité" :
                                    key === '2' ? "Travail" :
                                    key === '3' ? "Conduite" :
                                    key === '100' ? "Carte retirée" : label;
                                
                                return (
                                    <div key={key} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                        <span>
                                            {count} {__(`vehicles.activity.${label}`, { fallback: fallbackText })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default FleetMap; 