import React, { useEffect, useState, useRef } from "react";
import { Map, Marker, NavigationControl, Popup, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "@/utils/translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Map as MapIcon, Compass, Eye, EyeOff, Maximize2, Minimize2, MapPin, Circle, Navigation2, LocateFixed, Play, Pause, SkipForward, SkipBack, ChevronDown } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/format";

// Define the location type
export interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  ignition: boolean;
  moving: boolean;
  recorded_at: string;
  address?: string | null;
}

interface VehicleLocationMapProps {
  locations: LocationPoint[];
  title?: string;
  className?: string;
  initialShowAllPoints?: boolean;
}

// Define view state type with additional padding property
interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Define view state change event type
interface ViewStateChangeEvent {
  viewState: MapViewState;
}

export default function VehicleLocationMap({ 
  locations, 
  title = "Vehicle Locations", 
  className,
  initialShowAllPoints = true
}: VehicleLocationMapProps) {
  const { __ } = useTranslation();
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [showAllPoints, setShowAllPoints] = useState<boolean>(initialShowAllPoints);
  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
  
  // Timeline state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  // Default viewport settings
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 0,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  // Check if the last location is currently moving
  const isCurrentlyMoving = locations.length > 0 && locations[locations.length - 1].moving;

  // Get the points to display based on the current mode
  const getDisplayPoints = () => {
    if (isPlaying) {
      // During playback, show all points up to current position
      return locations.slice(0, playbackIndex + 1);
    } else if (showAllPoints || locations.length <= 2) {
      return locations;
    } else {
      // Only return start and end points
      return [locations[0], locations[locations.length - 1]];
    }
  };

  const displayPoints = getDisplayPoints();
  
  // Create GeoJSON data for the route (main line)
  const createRouteGeoJSON = () => {
    if (isPlaying) {
      // Only show route up to current playback point
      const currentPoints = locations.slice(0, playbackIndex + 1);
      return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: currentPoints.map(loc => [loc.longitude, loc.latitude])
        }
      };
    }

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: locations.map(loc => [loc.longitude, loc.latitude])
      }
    };
  };
  
  // Center the map on the locations when they change
  useEffect(() => {
    if (locations.length > 0) {
      // Calculate center point of all locations
      const bounds = getBounds(locations);
      
      setViewState({
        ...viewState,
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        zoom: calculateZoomLevel(bounds)
      });
    }
  }, [locations]);

  // Playback animation effect
  useEffect(() => {
    if (isPlaying && playbackIndex < locations.length - 1) {
      const animate = (timestamp: number) => {
        if (!lastUpdateTimeRef.current) {
          lastUpdateTimeRef.current = timestamp;
        }
  
        const elapsed = timestamp - lastUpdateTimeRef.current;
        
        // Update based on playback speed - adjust interval as needed for smooth playback
        if (elapsed > (1000 / (playbackSpeed * 4))) {
          lastUpdateTimeRef.current = timestamp;
          setPlaybackIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            if (newIndex >= locations.length - 1) {
              setIsPlaying(false);
              return locations.length - 1;
            }
            return newIndex;
          });
          
          // Center map on current point
          if (locations[playbackIndex]) {
            setViewState(prev => ({
              ...prev,
              longitude: locations[playbackIndex].longitude,
              latitude: locations[playbackIndex].latitude,
            }));
          }
        }
  
        animationRef.current = requestAnimationFrame(animate);
      };
  
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }
  }, [isPlaying, playbackIndex, locations, playbackSpeed]);

  // Reset animation when locations change
  useEffect(() => {
    setPlaybackIndex(0);
    setIsPlaying(false);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [locations]);

  // Reset view to fit all points
  const resetView = () => {
    if (locations.length > 0) {
      const bounds = getBounds(locations);
      
      setViewState({
        ...viewState,
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        zoom: calculateZoomLevel(bounds)
      });
    }
  };

  // Calculate bounds for the locations
  const getBounds = (points: LocationPoint[]) => {
    let minLat = Number.MAX_VALUE;
    let maxLat = -Number.MAX_VALUE;
    let minLng = Number.MAX_VALUE;
    let maxLng = -Number.MAX_VALUE;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    return { minLat, maxLat, minLng, maxLng };
  };

  // Calculate appropriate zoom level based on the bounds
  const calculateZoomLevel = (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff <= 0.01) return 14; // Very close points
    if (maxDiff <= 0.05) return 13;
    if (maxDiff <= 0.1) return 12;
    if (maxDiff <= 0.5) return 10;
    if (maxDiff <= 1) return 9;
    if (maxDiff <= 5) return 7;
    return 5; // Very distant points
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return formatDate(timestamp, 'TIME') || 'N/A';
  };
  
  // Handle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    lastUpdateTimeRef.current = 0;
  };

  // Jump to start of timeline
  const jumpToStart = () => {
    setPlaybackIndex(0);
    if (locations[0]) {
      setViewState(prev => ({
        ...prev,
        longitude: locations[0].longitude,
        latitude: locations[0].latitude,
      }));
    }
  };

  // Jump to end of timeline
  const jumpToEnd = () => {
    setPlaybackIndex(locations.length - 1);
    if (locations[locations.length - 1]) {
      setViewState(prev => ({
        ...prev,
        longitude: locations[locations.length - 1].longitude,
        latitude: locations[locations.length - 1].latitude,
      }));
    }
  };

  // Handle timeline slider change
  const handleTimelineChange = (value: number[]) => {
    const newIndex = value[0];
    setPlaybackIndex(newIndex);
    
    if (locations[newIndex]) {
      setViewState(prev => ({
        ...prev,
        longitude: locations[newIndex].longitude,
        latitude: locations[newIndex].latitude,
      }));
    }
  };

  // Get current time display
  const getCurrentTimeDisplay = () => {
    if (locations.length === 0 || !locations[playbackIndex]) {
      return "";
    }
    return formatTime(locations[playbackIndex].recorded_at);
  };

  // If no locations, show a message
  if (locations.length === 0) {
    return (
      <Card className={cn("mb-6", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            {__(title)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
            <MapIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">{__("devices.messages.no_location_data")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {__("devices.messages.no_locations_available")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mapContent = (
    <div className={cn("relative", showFullscreen ? "fixed inset-0 z-50 p-4 bg-background" : "h-[300px] sm:h-[400px] rounded-md overflow-hidden")}>
      <div className="absolute top-2 right-2 z-10 flex gap-1 sm:gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                pressed={showAllPoints} 
                onPressedChange={setShowAllPoints}
                aria-label={showAllPoints ? __("devices.map.hide_all_points") : __("devices.map.show_all_points")}
                size="sm"
                className="bg-background/90 hover:bg-background border border-border shadow-sm h-7 w-7 sm:h-8 sm:w-8"
                disabled={isPlaying}
              >
                {showAllPoints ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {showAllPoints ? __("devices.map.hide_all_points") : __("devices.map.show_all_points")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-sm" 
                onClick={resetView}
              >
                <LocateFixed className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {__("devices.map.reset_view")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-sm" 
                onClick={() => setShowFullscreen(!showFullscreen)}
              >
                {showFullscreen ? <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showFullscreen ? __("devices.map.exit_fullscreen") : __("devices.map.fullscreen")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Base path line */}
        {locations.length > 1 && (
          <Source id="route-base" type="geojson" data={createRouteGeoJSON()}>
            <Layer
              id="route-base"
              type="line"
              source="route-base"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#4096ff',
                'line-width': showAllPoints ? 4 : 3,
                'line-opacity': 0.6,
                'line-dasharray': showAllPoints ? [1, 0] : [2, 1] // Solid line for all points, dashed for start-end
              }}
            />
          </Source>
        )}
        
        {/* Direction line (directional overlay on top of the base line) */}
        {locations.length > 1 && (
          <Source id="route-direction" type="geojson" data={createRouteGeoJSON()}>
            <Layer
              id="route-direction-outer"
              type="line"
              source="route-direction"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#2563eb', // Darker blue for direction
                'line-width': showAllPoints ? 5 : 4,
                'line-opacity': 0.3,
                'line-blur': 3
              }}
            />
            <Layer
              id="route-direction"
              type="line"
              source="route-direction"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#60a5fa', // Lighter blue for direction
                'line-width': showAllPoints ? 2 : 1.5,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
        
        {/* Current playback position marker */}
        {isPlaying && locations[playbackIndex] && (
          <Marker
            key="current-playback"
            longitude={locations[playbackIndex].longitude}
            latitude={locations[playbackIndex].latitude}
            anchor="center"
          >
            <div className="relative text-yellow-500">
              <div className="absolute w-12 h-12 -mt-6 -ml-6 rounded-full bg-yellow-500 opacity-20 animate-ping" />
              <Navigation2 
                className="w-8 h-8"
                style={{ transform: `rotate(${locations[playbackIndex].heading}deg)` }}
                fill="rgba(234, 179, 8, 0.3)"
              />
            </div>
          </Marker>
        )}
        
        {/* Render points with different markers based on their position and state */}
        {displayPoints.map((location, index) => {
          const isStartPoint = index === 0;
          const isEndPoint = index === displayPoints.length - 1 && displayPoints.length > 1;
          const isLastLocationAndMoving = isEndPoint && isCurrentlyMoving;
          
          // Skip rendering current playback position as it has its own marker
          if (isPlaying && index === playbackIndex) {
            return null;
          }
          
          // Use a special icon for the last point if it's currently moving
          if (isLastLocationAndMoving) {
            return (
              <Marker
                key={location.id || index}
                longitude={location.longitude}
                latitude={location.latitude}
                anchor="center"
                onClick={() => {
                  setSelectedPoint(location);
                }}
              >
                <div className="relative text-green-600 animate-pulse">
                  <Navigation2 
                    className="w-8 h-8"
                    style={{ transform: `rotate(${location.heading}deg)` }}
                    fill="rgba(22, 163, 74, 0.2)"
                  />
                </div>
              </Marker>
            );
          }
          
          // Start point
          if (isStartPoint) {
            return (
              <Marker
                key={location.id || index}
                longitude={location.longitude}
                latitude={location.latitude}
                anchor="bottom"
                onClick={() => {
                  setSelectedPoint(location);
                }}
              >
                <div className="relative text-blue-600">
                  <div className="absolute w-10 h-10 -mt-5 -ml-5 rounded-full bg-current opacity-20 animate-pulse" />
                  <MapPin 
                    className="w-6 h-6 transform -translate-x-3 -translate-y-3"
                    fill="rgba(37, 99, 235, 0.3)" 
                  />
                </div>
              </Marker>
            );
          }
          
          // End point (non-moving)
          if (isEndPoint) {
            return (
              <Marker
                key={location.id || index}
                longitude={location.longitude}
                latitude={location.latitude}
                anchor="bottom"
                onClick={() => {
                  setSelectedPoint(location);
                }}
              >
                <div className="relative text-red-600">
                  <div className="absolute w-10 h-10 -mt-5 -ml-5 rounded-full bg-current opacity-20" />
                  <Circle 
                    className="w-6 h-6 transform -translate-x-3 -translate-y-3"
                    fill="rgba(220, 38, 38, 0.3)" 
                  />
                </div>
              </Marker>
            );
          }
          
          // Regular point (only shown when showAllPoints is true)
          return (
            <Marker
              key={location.id || index}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="center"
              onClick={() => {
                setSelectedPoint(location);
              }}
            >
              <div className={cn(
                "relative",
                location.moving ? "text-green-600" : "text-gray-600"
              )}>
                <Compass 
                  className="w-5 h-5" 
                  style={{ 
                    transform: `rotate(${location.heading}deg)`,
                  }}
                  opacity={0.7}
                />
              </div>
            </Marker>
          );
        })}

        {selectedPoint && (
          <Popup
            longitude={selectedPoint.longitude}
            latitude={selectedPoint.latitude}
            anchor="bottom"
            onClose={() => setSelectedPoint(null)}
            closeOnClick={false}
            className="z-20"
            maxWidth="300px"
          >
            <div className="p-2 max-w-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">{formatTime(selectedPoint.recorded_at)}</h4>
                <span className="text-xs text-muted-foreground">{formatDate(selectedPoint.recorded_at, 'DATE_MED')}</span>
              </div>
              
              {selectedPoint.address && (
                <p className="text-xs mt-1">{selectedPoint.address}</p>
              )}
              
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  {selectedPoint.speed} {__("devices.map.km_per_hour")}
                </Badge>
                
                <Badge 
                  variant={selectedPoint.ignition ? "default" : "outline"} 
                  className="text-xs"
                >
                  {selectedPoint.ignition 
                    ? __("devices.messages.ignition_on") 
                    : __("devices.messages.ignition_off")}
                </Badge>
                
                <Badge 
                  variant={selectedPoint.moving ? "default" : "outline"} 
                  className="text-xs"
                >
                  {selectedPoint.moving 
                    ? __("devices.messages.moving_state") 
                    : __("devices.messages.stationary")}
                </Badge>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
              </div>
              
              <div className="mt-1 text-xs text-muted-foreground">
                {__("devices.map.heading")}: {selectedPoint.heading}°
              </div>
            </div>
          </Popup>
        )}
        
        <NavigationControl position="bottom-right" />
      </Map>
      
      {showFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 p-2 rounded-md shadow-lg z-10 mt-16 hidden sm:block">
          <div className="flex items-center gap-2 justify-center">
            <Badge variant="outline">
              {locations.length} {__("devices.messages.locations")}
            </Badge>
            
            <Badge variant="outline">
              {locations[0].recorded_at ? formatTime(locations[0].recorded_at) : ""} → {locations[locations.length - 1].recorded_at ? formatTime(locations[locations.length - 1].recorded_at) : ""}
            </Badge>
            
            {isCurrentlyMoving && (
              <Badge variant="default" className="bg-green-600">
                {__("devices.messages.currently_moving")}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // If in fullscreen mode, render only the map
  if (showFullscreen) {
    return mapContent;
  }

  const timelineContent = (
    <div className="mt-4 sm:mt-5 bg-muted/10 border rounded-lg p-2 sm:p-3">
      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-2">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground min-w-0">
          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs px-1 py-0.5 sm:px-2 sm:py-1">
            {formatTime(locations[0].recorded_at)}
          </Badge>
          <span className="hidden sm:inline">{formatDate(locations[0].recorded_at, 'DATE_MED')}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  onClick={jumpToStart}
                  disabled={playbackIndex === 0}
                >
                  <SkipBack className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {__("devices.map.jump_to_start")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isPlaying ? __("devices.map.pause") : __("devices.map.play")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  onClick={jumpToEnd}
                  disabled={playbackIndex === locations.length - 1}
                >
                  <SkipForward className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {__("devices.map.jump_to_end")}
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
                      size="sm"
                      className="h-6 px-1.5 sm:h-7 sm:px-2 flex items-center gap-1 text-xs"
                    >
                      {playbackSpeed}x <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {__("devices.map.playback_speed")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setPlaybackSpeed(0.5)}>0.5x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlaybackSpeed(1)}>1x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlaybackSpeed(2)}>2x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlaybackSpeed(4)}>4x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlaybackSpeed(8)}>8x</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground min-w-0">
          <span className="hidden sm:inline">{formatDate(locations[locations.length - 1].recorded_at, 'DATE_MED')}</span>
          <Badge variant="outline" className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs px-1 py-0.5 sm:px-2 sm:py-1">
            {formatTime(locations[locations.length - 1].recorded_at)}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-xs font-medium text-center w-12 sm:w-16 bg-yellow-50 dark:bg-yellow-950/30 py-1 px-1 sm:px-2 rounded-md border border-yellow-100 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400">
          {getCurrentTimeDisplay()}
        </div>
        
        <Slider
          value={[playbackIndex]}
          min={0}
          max={locations.length - 1}
          step={1}
          onValueChange={handleTimelineChange}
          className="flex-1"
        />
        
        <div className="text-xs font-medium w-10 sm:w-14 text-center bg-muted/20 py-1 px-1 sm:px-2 rounded-md border border-muted/20">
          {playbackIndex + 1}/{locations.length}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">{__(title)}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <Badge variant="outline" className="text-xs">
              {locations.length} {__("devices.messages.locations")}
            </Badge>
            {isCurrentlyMoving && (
              <Badge variant="default" className="bg-green-600 text-xs">
                {__("devices.messages.active")}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {mapContent}
        {timelineContent}
      </CardContent>
    </Card>
  );
} 