import React, { useEffect, useRef, useState, useCallback } from "react";
import Map, { MapRef, NavigationControl, Source, Layer, Popup } from "react-map-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useTranslation } from "@/utils/translation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
    RotateCcw, 
    Square, 
    Trash2, 
    Move, 
    Eye,
    EyeOff,
    Maximize2,
    Minimize2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Type for MapboxDraw feature with ID
interface DrawFeatureWithId extends GeoJSON.Feature {
    id: string | number;
}

interface GeofenceDrawingMapProps {
    className?: string;
    height?: string;
    initialGeojson?: GeoJSON.Geometry | null;
    onGeofenceChange?: (geojson: GeoJSON.Geometry | null) => void;
    existingGeofences?: Array<{
        id: string;
        name: string;
        geojson: GeoJSON.Geometry;
        is_active: boolean;
    }>;
    showExistingGeofences?: boolean;
    center?: [number, number];
    zoom?: number;
    readonly?: boolean;
    onGeofenceClick?: (geofence: { id: string; name: string; is_active: boolean }) => void;
}

export default function GeofenceDrawingMap({
    className,
    height = "400px",
    initialGeojson,
    onGeofenceChange,
    existingGeofences = [],
    showExistingGeofences = true,
    center = [2.3522, 48.8566], // Paris by default
    zoom = 10,
    readonly = false,
    onGeofenceClick,
}: GeofenceDrawingMapProps) {
    const { __ } = useTranslation();
    const mapRef = useRef<MapRef>(null);
    const drawRef = useRef<MapboxDraw | null>(null);
    
    const [viewState, setViewState] = useState({
        longitude: center[0],
        latitude: center[1],
        zoom: zoom,
    });
    
    const [currentMode, setCurrentMode] = useState<string>('simple_select');
    const [hasDrawnFeature, setHasDrawnFeature] = useState(false);
    const [showExisting, setShowExisting] = useState(showExistingGeofences);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [hoveredGeofence, setHoveredGeofence] = useState<{ 
        id: string; 
        name: string; 
        is_active: boolean; 
        coordinates: [number, number] 
    } | null>(null);

    // Mapbox token from environment
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Log debugging information
    useEffect(() => {
        console.log('GeofenceDrawingMap - Configuration:', {
            mapboxToken: mapboxToken ? 'Present' : 'Missing',
            readonly,
            initialGeojson: !!initialGeojson,
            height,
            center,
            zoom
        });

        if (!mapboxToken) {
            const errorMsg = 'VITE_MAPBOX_TOKEN is not defined. Please check your .env file.';
            console.error(errorMsg);
            setMapError(errorMsg);
        }
    }, [mapboxToken, readonly, initialGeojson, height, center, zoom]);

    // Initialize Mapbox Draw
    useEffect(() => {
        if (!mapRef.current || drawRef.current || readonly || !mapLoaded || mapError) {
            console.log('Skipping draw initialization:', {
                mapRef: !!mapRef.current,
                drawRef: !!drawRef.current,
                readonly,
                mapLoaded,
                mapError
            });
            return;
        }

        console.log('Initializing Mapbox Draw...');

        try {
            const draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {},
                styles: [
                    // Polygon fill
                    {
                        id: 'gl-draw-polygon-fill-inactive',
                        type: 'fill',
                        filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                        paint: {
                            'fill-color': '#3b82f6',
                            'fill-outline-color': '#3b82f6',
                            'fill-opacity': 0.1
                        }
                    },
                    {
                        id: 'gl-draw-polygon-fill-active',
                        type: 'fill',
                        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                        paint: {
                            'fill-color': '#fbbf24',
                            'fill-outline-color': '#fbbf24',
                            'fill-opacity': 0.1
                        }
                    },
                    // Polygon stroke
                    {
                        id: 'gl-draw-polygon-stroke-inactive',
                        type: 'line',
                        filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#3b82f6',
                            'line-width': 2
                        }
                    },
                    {
                        id: 'gl-draw-polygon-stroke-active',
                        type: 'line',
                        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#fbbf24',
                            'line-width': 3
                        }
                    },
                    // Vertex points
                    {
                        id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
                        type: 'circle',
                        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                        paint: {
                            'circle-radius': 5,
                            'circle-color': '#fff'
                        }
                    },
                    {
                        id: 'gl-draw-polygon-and-line-vertex-inactive',
                        type: 'circle',
                        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                        paint: {
                            'circle-radius': 3,
                            'circle-color': '#fbbf24',
                        }
                    }
                ]
            });

            // Add draw control to map
            const map = mapRef.current.getMap();
            map.addControl(draw, 'top-left');
            drawRef.current = draw;

            console.log('Mapbox Draw initialized successfully');

            // Set up event listeners
            const onDrawCreate = (e: { features: GeoJSON.Feature[] }) => {
                console.log('Draw create event:', e);
                setHasDrawnFeature(true);
                if (onGeofenceChange) {
                    const features = draw.getAll();
                    if (features.features.length > 0) {
                        onGeofenceChange(features.features[0].geometry as GeoJSON.Geometry);
                    }
                }
            };

            const onDrawUpdate = (e: { features: GeoJSON.Feature[]; action: string }) => {
                console.log('Draw update event:', e);
                if (onGeofenceChange) {
                    const features = draw.getAll();
                    if (features.features.length > 0) {
                        onGeofenceChange(features.features[0].geometry as GeoJSON.Geometry);
                    }
                }
            };

            const onDrawDelete = (e: { features: GeoJSON.Feature[] }) => {
                console.log('Draw delete event:', e);
                setHasDrawnFeature(false);
                if (onGeofenceChange) {
                    onGeofenceChange(null);
                }
            };

            const onDrawModeChange = (e: { mode: string }) => {
                console.log('Draw mode change:', e.mode);
                setCurrentMode(e.mode);
            };

            map.on('draw.create', onDrawCreate);
            map.on('draw.update', onDrawUpdate);
            map.on('draw.delete', onDrawDelete);
            map.on('draw.modechange', onDrawModeChange);

            // Load initial geojson if provided
            if (initialGeojson) {
                console.log('Loading initial geojson:', initialGeojson);
                try {
                    const featureIds = draw.add({
                        type: 'Feature',
                        properties: {},
                        geometry: initialGeojson
                    });
                    setHasDrawnFeature(true);
                    
                    // If not readonly and has initial data, start in edit mode
                    if (!readonly && featureIds && featureIds.length > 0) {
                        setTimeout(() => {
                            if (drawRef.current) {
                                draw.changeMode('direct_select', {
                                    featureId: featureIds[0]
                                });
                            }
                        }, 300);
                    }
                } catch (error) {
                    console.error('Error loading initial geojson:', error);
                }
            } else if (!readonly) {
                // If no initial data and not readonly, provide instructions for drawing
                console.log('No initial data, ready for drawing');
            }

            return () => {
                console.log('Cleaning up Mapbox Draw...');
                if (mapRef.current && drawRef.current) {
                    const map = mapRef.current.getMap();
                    map.off('draw.create', onDrawCreate);
                    map.off('draw.update', onDrawUpdate);
                    map.off('draw.delete', onDrawDelete);
                    map.off('draw.modechange', onDrawModeChange);
                    try {
                        map.removeControl(drawRef.current);
                    } catch (e) {
                        console.warn('Error removing draw control:', e);
                    }
                    drawRef.current = null;
                }
            };
        } catch (error) {
            console.error('Error initializing Mapbox Draw:', error);
            setMapError('Failed to initialize drawing tools');
        }
    }, [mapLoaded, readonly, mapError, onGeofenceChange]);

    // Handle initialGeojson changes separately to ensure proper re-rendering
    useEffect(() => {
        if (!drawRef.current || readonly) return;

        console.log('Handling initialGeojson change:', initialGeojson);

        // Clear existing features
        drawRef.current.deleteAll();
        setHasDrawnFeature(false);

        // Load new geojson if provided
        if (initialGeojson) {
            try {
                const featureIds = drawRef.current.add({
                    type: 'Feature',
                    properties: {},
                    geometry: initialGeojson
                });
                setHasDrawnFeature(true);
                
                // If not readonly and has initial data, start in edit mode
                if (!readonly && featureIds && featureIds.length > 0) {
                    setTimeout(() => {
                        if (drawRef.current) {
                            drawRef.current.changeMode('direct_select', {
                                featureId: featureIds[0]
                            });
                        }
                    }, 300);
                }
            } catch (error) {
                console.error('Error loading geojson:', error);
            }
        }
    }, [initialGeojson, readonly]);

    // Drawing mode handlers
    const startDrawingPolygon = useCallback(() => {
        console.log('Starting polygon drawing...');
        if (drawRef.current) {
            try {
                // Clear existing features first
                drawRef.current.deleteAll();
                setHasDrawnFeature(false);
                // Start polygon drawing
                drawRef.current.changeMode('draw_polygon');
                console.log('Polygon drawing mode activated');
            } catch (error) {
                console.error('Error starting polygon drawing:', error);
            }
        } else {
            console.error('Draw control not initialized');
        }
    }, []);

    const startEditingMode = useCallback(() => {
        console.log('Starting editing mode...');
        if (drawRef.current) {
            try {
                const features = drawRef.current.getAll();
                if (features.features.length > 0) {
                    const feature = features.features[0] as DrawFeatureWithId;
                    drawRef.current.changeMode('direct_select', {
                        featureId: feature.id
                    });
                    console.log('Edit mode activated for feature:', feature.id);
                } else {
                    drawRef.current.changeMode('simple_select');
                    console.log('No features to edit, switched to simple select');
                }
            } catch (error) {
                console.error('Error starting editing mode:', error);
            }
        } else {
            console.error('Draw control not initialized');
        }
    }, []);

    const clearAll = useCallback(() => {
        console.log('Clearing all features...');
        if (drawRef.current) {
            try {
                drawRef.current.deleteAll();
                setHasDrawnFeature(false);
                if (onGeofenceChange) {
                    onGeofenceChange(null);
                }
                console.log('All features cleared');
            } catch (error) {
                console.error('Error clearing features:', error);
            }
        }
    }, [onGeofenceChange]);

    const resetView = useCallback(() => {
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: center,
                zoom: zoom,
                duration: 1000
            });
        }
    }, [center, zoom]);

    // Handle map load event
    const handleMapLoad = useCallback(() => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        setMapError(null);
    }, []);

    // Handle map error event
    const handleMapError = useCallback((e: { error: Error }) => {
        console.error('Map error:', e.error);
        setMapError('Failed to load map. Please check your internet connection and Mapbox token.');
    }, []);

    // Create GeoJSON for existing geofences
    const existingGeofencesGeoJSON = {
        type: 'FeatureCollection' as const,
        features: existingGeofences.map((geofence) => ({
            type: 'Feature' as const,
            properties: {
                id: geofence.id,
                name: geofence.name,
                is_active: geofence.is_active
            },
            geometry: geofence.geojson
        }))
    };

    // Show error state if token is missing or other critical errors
    if (mapError) {
        return (
            <div className={cn(
                "relative border rounded-md overflow-hidden bg-muted/20 flex items-center justify-center",
                className
            )} style={{ height }}>
                <div className="text-center p-6">
                    <div className="text-red-500 mb-2">⚠️ Erreur de carte</div>
                    <p className="text-sm text-muted-foreground">{mapError}</p>
                    {!mapboxToken && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Vérifiez que VITE_MAPBOX_TOKEN est défini dans votre fichier .env
                        </p>
                    )}
                </div>
            </div>
        );
    }

    const mapContent = (
        <div className={cn(
            "relative border rounded-md overflow-hidden bg-muted/20",
            isFullscreen ? "fixed inset-0 z-50 p-4 bg-background" : "",
            className
        )} style={{ height: isFullscreen ? "100vh" : height }}>
            
            {/* Drawing Controls - Only show when not readonly */}
            {!readonly && (
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="flex flex-col gap-1 bg-background/90 p-2 rounded-md shadow-sm">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={currentMode === 'draw_polygon' ? "default" : "outline"}
                                        size="sm"
                                        onClick={startDrawingPolygon}
                                        disabled={!mapLoaded || !drawRef.current}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Square className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {__("geofences.map.draw_polygon")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={currentMode === 'direct_select' ? "default" : "outline"}
                                        size="sm"
                                        onClick={startEditingMode}
                                        disabled={!hasDrawnFeature || !mapLoaded || !drawRef.current}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Move className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {__("geofences.map.edit_polygon")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAll}
                                        disabled={!hasDrawnFeature || !mapLoaded || !drawRef.current}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {__("geofences.map.clear_all")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}

            {/* View Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <div className="flex flex-col gap-1 bg-background/90 p-2 rounded-md shadow-sm">
                    {existingGeofences.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowExisting(!showExisting)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {showExisting ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {showExisting ? __("geofences.map.hide_existing") : __("geofences.map.show_existing")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={resetView}
                                    className="h-8 w-8 p-0"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {__("geofences.map.reset_view")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="h-8 w-8 p-0"
                                >
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isFullscreen ? __("geofences.map.exit_fullscreen") : __("geofences.map.fullscreen")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Status Indicator */}
            {currentMode !== 'simple_select' && (
                <div className="absolute bottom-4 left-4 z-10">
                    <Badge variant="secondary" className="bg-background/90">
                        {currentMode === 'draw_polygon' && __("geofences.map.drawing_mode")}
                        {currentMode === 'direct_select' && __("geofences.map.editing_mode")}
                    </Badge>
                </div>
            )}

            {/* Instructions */}
            {!readonly && !hasDrawnFeature && currentMode === 'simple_select' && mapLoaded && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-background/90 px-3 py-2 rounded-md shadow-sm text-sm text-muted-foreground">
                        {__("geofences.map.click_polygon_to_start")}
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {!mapLoaded && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50">
                    <div className="text-sm text-muted-foreground">Chargement de la carte...</div>
                </div>
            )}

            <Map
                ref={mapRef}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={mapboxToken}
                style={{ width: "100%", height: "100%" }}
                onLoad={handleMapLoad}
                onError={handleMapError}
                onMouseMove={(e) => {
                    if (readonly && onGeofenceClick && showExisting && existingGeofences.length > 0) {
                        try {
                            const features = e.target.queryRenderedFeatures(e.point, {
                                layers: ['existing-geofences-fill']
                            });
                            if (features.length > 0) {
                                const feature = features[0];
                                setHoveredGeofence({
                                    id: feature.properties?.id,
                                    name: feature.properties?.name,
                                    is_active: feature.properties?.is_active,
                                    coordinates: [e.lngLat.lng, e.lngLat.lat]
                                });
                                e.target.getCanvas().style.cursor = 'pointer';
                            } else {
                                setHoveredGeofence(null);
                                e.target.getCanvas().style.cursor = '';
                            }
                        } catch {
                            // Layer might not exist yet, silently ignore
                            setHoveredGeofence(null);
                            e.target.getCanvas().style.cursor = '';
                        }
                    }
                }}
                onClick={(e) => {
                    if (readonly && onGeofenceClick && showExisting && existingGeofences.length > 0) {
                        try {
                            const features = e.target.queryRenderedFeatures(e.point, {
                                layers: ['existing-geofences-fill']
                            });
                            if (features.length > 0) {
                                const feature = features[0];
                                onGeofenceClick({
                                    id: feature.properties?.id,
                                    name: feature.properties?.name,
                                    is_active: feature.properties?.is_active
                                });
                            }
                        } catch {
                            // Layer might not exist yet, silently ignore
                        }
                    }
                }}
            >
                <NavigationControl position="bottom-right" />

                {/* Existing Geofences */}
                {showExisting && existingGeofences.length > 0 && (
                    <Source id="existing-geofences" type="geojson" data={existingGeofencesGeoJSON}>
                        <Layer
                            id="existing-geofences-fill"
                            type="fill"
                            source="existing-geofences"
                            paint={{
                                'fill-color': [
                                    'case',
                                    ['get', 'is_active'],
                                    '#10b981', // Active - green
                                    '#6b7280'  // Inactive - gray
                                ],
                                'fill-opacity': 0.1
                            }}
                        />
                        <Layer
                            id="existing-geofences-stroke"
                            type="line"
                            source="existing-geofences"
                            paint={{
                                'line-color': [
                                    'case',
                                    ['get', 'is_active'],
                                    '#10b981', // Active - green
                                    '#6b7280'  // Inactive - gray
                                ],
                                'line-width': 2,
                                'line-opacity': 0.8
                            }}
                        />
                    </Source>
                )}

                {/* Geofence Popup */}
                {hoveredGeofence && readonly && (
                    <Popup
                        longitude={hoveredGeofence.coordinates[0]}
                        latitude={hoveredGeofence.coordinates[1]}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="bottom"
                        className="geofence-popup"
                    >
                        <div className="bg-background border border-border rounded-md shadow-lg p-3 min-w-[150px]">
                            <div className="font-medium text-sm mb-2 text-foreground">
                                {hoveredGeofence.name || __('geofences.unnamed')}
                            </div>
                            <div className="mb-2">
                                <Badge 
                                    variant={hoveredGeofence.is_active ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {hoveredGeofence.is_active ? __('geofences.status.active') : __('geofences.status.inactive')}
                                </Badge>
                            </div>
                            {onGeofenceClick && (
                                <div className="text-xs text-muted-foreground">
                                    {__('common.click_to_view_details')}
                                </div>
                            )}
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );

    return mapContent;
} 