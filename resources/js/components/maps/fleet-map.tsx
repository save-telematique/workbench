import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { 
    Marker, 
    Popup,
    MapRef, 
} from "react-map-gl";
import { useTranslation } from "@/utils/translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    Map as MapIcon, 
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format";
import { VehicleResource } from "@/types";
import { Link } from "@inertiajs/react";
import useSupercluster from "use-supercluster";
import { BBox } from "geojson";
import { LicensePlate } from "../ui/license-plate";
import BaseMap, { VehicleIcon, activityColors } from "@/components/maps/base-map";
import { ActivityLegend } from "@/components/maps/activity-legend";

interface FleetMapProps {
    className?: string;
    title?: string;
    showFullscreenOption?: boolean;
    initialSelectedVehicleId?: string;
    refreshInterval?: number;
    // These props are now optional as the component will fetch data internally
    vehicles?: VehicleResource[];  
    onVehicleClick?: (vehicle: VehicleResource) => void;
    onMarkerClick?: (vehicle: VehicleResource) => void;
    refreshVehicles?: () => void;
}

// Status color mapping
const statusColors = {
    moving: "#16a34a", // Moving - green
    idling: "#f59e0b", // Idling - amber
    parked: "#6b7280", // Parked - gray
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
    showFullscreenOption = true,
    initialSelectedVehicleId,
    refreshInterval = 60,
    // Optional external props
    vehicles: externalVehicles,
    onVehicleClick,
    onMarkerClick,
    refreshVehicles: externalRefreshVehicles
}) => {
    const { __ } = useTranslation();
    const mapRef = useRef<MapRef>(null);
    
    // Component state
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
        initialSelectedVehicleId || null
    );
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [bounds, setBounds] = useState<BBox | null>(null);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const [didInitialReset, setDidInitialReset] = useState<boolean>(false);
    const showLegend = true;
    
    // Internal vehicles state - will be used if externalVehicles is not provided
    const [internalVehicles, setInternalVehicles] = useState<VehicleResource[]>([]);
    
    // Use external vehicles if provided, otherwise use internal state
    const vehicles = externalVehicles || internalVehicles;
    
    // Get vehicles with location data - memoize to prevent recreation on every render
    const filteredVehicles = useMemo(() => vehicles?.filter(
        (vehicle) => vehicle && vehicle.current_location && 
        vehicle.current_location.latitude && 
        vehicle.current_location.longitude
    ) || [], [vehicles]);

    // Create points for clustering from filtered vehicles - memoize to prevent recreation
    const points = useMemo(() => filteredVehicles.map(vehicle => ({
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
    })), [filteredVehicles]);

    // Fetch vehicles data internally - useCallback to maintain reference stability
    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            
            // If external refresh function is provided, call it
            if (externalRefreshVehicles) {
                externalRefreshVehicles();
            } else {
                // Otherwise fetch data internally
                const response = await fetch(route('vehicles.locations'));
                
                if (!response.ok) {
                    throw new Error("Failed to fetch vehicle locations");
                }
                
                const data = await response.json();
                setInternalVehicles(data);
            }
            
            setLastRefresh(new Date());
            setError(null);
        } catch (err) {
            console.error('Error fetching vehicle locations:', err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [externalRefreshVehicles]);

    // Handler for when the map is loaded - useCallback for stability
    const handleMapLoad = useCallback(() => {
        setMapLoaded(true);
        setLoading(false);
        
        // Auto-fit to vehicle locations if available, but only once on initial load
        if (filteredVehicles.length > 0 && !didInitialReset) {
            resetView();
            setDidInitialReset(true);
        }
    }, [filteredVehicles, didInitialReset]);

    // Handle bounds change - useCallback for stability
    const handleBoundsChange = useCallback((newBounds: BBox) => {
        setBounds(newBounds);
    }, []);

    // Calculate bounds for the given vehicles - useCallback for stability
    const getBounds = useCallback((vehicles: VehicleResource[]) => {
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

        // If no locations were found or values are invalid, use default center of France
        if (minLat === Number.MAX_VALUE || maxLat === -Number.MAX_VALUE || 
            minLng === Number.MAX_VALUE || maxLng === -Number.MAX_VALUE) {
            return { minLat: 46.0, maxLat: 47.0, minLng: 2.0, maxLng: 3.0 };
        }

        return { minLat, maxLat, minLng, maxLng };
    }, []);

    // Calculate view state based on bounds - useCallback for stability
    const calculateViewState = useCallback((bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
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
    }, []);

    // Reset map view to fit all vehicles - useCallback for stability
    const resetView = useCallback(() => {
        if (filteredVehicles.length > 0 && mapRef.current) {
            const bounds = getBounds(filteredVehicles);
            const { longitude, latitude, zoom } = calculateViewState(bounds);
            
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: zoom,
                duration: 1000
            });
        }
    }, [filteredVehicles, getBounds, calculateViewState]);

    // SuperCluster hook with stable dependency values
    const { clusters, supercluster } = useSupercluster({
        points,
        bounds: bounds || undefined,
        zoom: mapRef.current?.getZoom() || 5,
        options: {
            radius: 60,
            maxZoom: 20
        }
    });

    // Setup initial fetch and refresh interval
    useEffect(() => {
        // Fetch data immediately, but only if we're not using external vehicles data
        if (!externalVehicles) {
            fetchVehicles();
        }
        
        // Set up interval for refreshing
        const intervalId = setInterval(fetchVehicles, refreshInterval * 1000);
        
        // Clean up on unmount
        return () => clearInterval(intervalId);
    }, [refreshInterval, externalVehicles, fetchVehicles]);

    // Get the selected vehicle from the filtered vehicles - memoize the result
    const getSelectedVehicle = useCallback(() => {
        return filteredVehicles.find(v => v.id === selectedVehicleId);
    }, [filteredVehicles, selectedVehicleId]);

    // Vehicle stats - memoize these calculations
    const vehicleStats = useMemo(() => {
        const movingVehicles = filteredVehicles.filter(v => v.current_location?.moving).length;
        const idlingVehicles = filteredVehicles.filter(v => !v.current_location?.moving && v.current_location?.ignition).length;
        const parkedVehicles = filteredVehicles.filter(v => !v.current_location?.moving && !v.current_location?.ignition).length;
        
        // Count vehicles by activity
        const activitiesCounts = filteredVehicles.reduce((acc, vehicle) => {
            const activityId = vehicle.current_working_session?.activity?.id;
            if (activityId !== undefined) {
                acc[activityId] = (acc[activityId] || 0) + 1;
            }
            return acc;
        }, {} as Record<number, number>);

        return {
            movingVehicles,
            idlingVehicles,
            parkedVehicles,
            activitiesCounts
        };
    }, [filteredVehicles]);

    // Stats component to display in the map's info panel
    const MapStats = () => (
        <div className="flex gap-1.5 text-xs font-normal">
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
                {vehicleStats.movingVehicles} {__("vehicles.status.moving")}
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
                {vehicleStats.idlingVehicles} {__("vehicles.status.idling")}
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
                {vehicleStats.parkedVehicles} {__("vehicles.status.parked")}
            </Badge>
        </div>
    );

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
        const size = 30 + Math.min(pointCount / filteredVehicles.length * 50, 40);
        
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
                        
                        if (mapRef.current) {
                            mapRef.current.flyTo({
                                center: [longitude, latitude],
                                zoom: expansionZoom,
                                duration: 500
                            });
                        }
                    }}
                >
                    {pointCount}
                </div>
            </Marker>
        );
    };

    // Vehicle status tag component
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

    // Render map elements (markers, popups, etc.)
    const renderMapElements = () => {
        if (loading && filteredVehicles.length === 0) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }
        
        return (
            <>
                {/* Add legend if visible */}
                {showLegend && <ActivityLegend position="top-left" />}
                
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
                                isSelected={selectedVehicleId === vehicle.id}
                                onClick={() => {
                                    setSelectedVehicleId(vehicle.id);
                                    if (onVehicleClick) {
                                        onVehicleClick(vehicle);
                                    }
                                }}
                            />
                        </Marker>
                    );
                })}

                {/* Popup for selected vehicle */}
                {selectedVehicleId && getSelectedVehicle() && (
                    <Popup
                        longitude={getSelectedVehicle()?.current_location?.longitude || 0}
                        latitude={getSelectedVehicle()?.current_location?.latitude || 0}
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
                                    <LicensePlate registration={getSelectedVehicle()?.registration || ''} />
                                </Link>
                                <div className="text-xs text-muted-foreground">
                                    <span className="inline-flex items-center">
                                        {getSelectedVehicle()?.vehicle_model?.vehicle_brand?.name} {getSelectedVehicle()?.vehicle_model?.name}
                                        {getSelectedVehicle()?.type && (
                                            <span className="ml-1 text-muted-foreground/80">
                                                • {getSelectedVehicle()?.type?.name}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            
                            {/* All status badges grouped together */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {getSelectedVehicle() && (
                                    <VehicleStatusTag vehicle={getSelectedVehicle() as VehicleResource} />
                                )}
                                
                                <Badge variant="outline" className="text-xs">
                                    {getSelectedVehicle()?.current_location?.speed} {__("vehicles.map.km_per_hour")}
                                </Badge>
                                
                                {getSelectedVehicle()?.current_driver && (
                                    <Badge variant="outline" className="text-xs">
                                        {getSelectedVehicle()?.current_driver?.firstname} {getSelectedVehicle()?.current_driver?.surname}
                                    </Badge>
                                )}
                                
                                {getSelectedVehicle()?.current_working_session?.activity && getSelectedVehicle() && (
                                    <ActivityTag vehicle={getSelectedVehicle() as VehicleResource} />
                                )}
                            </div>
                            
                            {/* Address if available */}
                            {getSelectedVehicle()?.current_location?.address && (
                                <div className="flex items-start gap-2 text-xs mb-3 px-0.5 py-1.5 bg-muted/30 rounded-sm">
                                    <span className="flex-1 text-muted-foreground">
                                        {getSelectedVehicle()?.current_location?.address}
                                    </span>
                                </div>
                            )}
                            
                            {/* Timestamp */}
                            <div className="text-xs text-muted-foreground opacity-75">
                                {getSelectedVehicle()?.current_location?.recorded_at && 
                                  formatDate(String(getSelectedVehicle()?.current_location?.recorded_at), 'PPp')}
                            </div>
                        </div>
                    </Popup>
                )}
            </>
        );
    };

    // Activity distribution
    const activityDistribution = useMemo(() => {
        return Object.entries(activityColors).map(([key, { color, label }]) => {
            // Skip default entry
            if (key === 'default') return null;
            
            const activityId = parseInt(key);
            const count = vehicleStats.activitiesCounts[activityId] || 0;
            
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
        }).filter(Boolean); // Filter out null values
    }, [vehicleStats.activitiesCounts, __]);

    return (
        <Card className={cn("py-4", className)}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5" />
                        {__(title, { fallback: "Carte de la Flotte" })}
                        <Badge variant="outline">
                            {filteredVehicles.length} {__("vehicles.map.vehicles", { fallback: "véhicules" })}
                        </Badge>
                    </div>
                    <MapStats />
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
                        <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
                        <h3 className="text-lg font-medium">{__("common.error")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={fetchVehicles}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {__("common.retry")}
                        </Button>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
                        <MapIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">{__("vehicles.messages.no_vehicles_with_location")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {__("vehicles.messages.no_vehicle_locations_available")}
                        </p>
                        <Button variant="outline" className="mt-4" onClick={fetchVehicles}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {__("common.refresh")}
                        </Button>
                    </div>
                ) : (
                    <div className="h-[400px] relative">
                        <BaseMap
                            initialRefreshInterval={refreshInterval}
                            showFullscreenOption={showFullscreenOption}
                            onRefresh={fetchVehicles}
                            onMapLoad={handleMapLoad}
                            onBoundsChange={handleBoundsChange}
                            showLegendToggle={false}
                            showStyleSelector={true}
                            showRefreshButton={true}
                            showResetViewButton={true}
                            ref={mapRef}
                            initialShowLegend={false}
                            lastRefresh={lastRefresh}
                            stats={
                                <Badge variant="outline" className="bg-background/50">
                                    {filteredVehicles.length} {__("vehicles.map.vehicles_on_map")}
                                </Badge>
                            }
                        >
                            {renderMapElements()}
                        </BaseMap>
                    </div>
                )}
                
                {/* Activity legend for non-fullscreen view */}
                <div className="mt-2 p-2 flex flex-wrap gap-4 justify-between">
                    <div className="text-xs text-left text-muted-foreground">
                        {__("vehicles.map.last_updated", { fallback: "Dernière mise à jour" })}: {formatDate(lastRefresh, 'TIME')} 
                        <span className="mx-1">•</span> 
                        {__("vehicles.map.auto_refresh", { fallback: "Rafraîchissement auto" })}: {refreshInterval}s
                    </div>
                    
                    {/* Activity distribution */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        {activityDistribution}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default FleetMap; 