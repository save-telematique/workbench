import React, { useEffect, useState, useRef } from "react";
import { Marker, Popup, Source, Layer, MapRef } from "react-map-gl";
import { useTranslation } from "@/utils/translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Clock,
  Navigation2,
  MapIcon,
  AlertTriangle,
  RefreshCw,
  History,
  ArrowLeft,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDate } from "@/utils/format";
import { VehicleResource, VehicleLocationResource, ActivityResource, ActivityChangeResource } from "@/types";
import BaseMap, { VehicleIcon } from "@/components/maps/base-map";
import { LicensePlate } from "@/components/ui/license-plate";
import { Link } from "@inertiajs/react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface VehicleTrackingMapProps {
  vehicle: VehicleResource;
  className?: string;
  title?: string;
  initialDate?: Date;
  showDatePicker?: boolean;
  historyModeDefault?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

// Before the component definition, add a ViewState interface
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  transitionDuration?: number;
}

// Extend VehicleLocationResource to include activity
interface ExtendedVehicleLocationResource extends VehicleLocationResource {
  activity?: ActivityResource;
}

// Format function for timestamps
const formatTime = (timestamp: string) => {
  return formatDate(timestamp, 'HH:mm:ss') || 'N/A';
};

// Simple DatePicker component
const DatePicker = ({ 
  date, 
  onSelect,
  disabled = false,
}: {
  date: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
}) => {
  const { __ } = useTranslation();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-[180px] justify-start text-left font-normal", 
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>{__("common.pick_date")}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && onSelect(newDate)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default function VehicleTrackingMap({ 
  vehicle, 
  className, 
  title = "vehicle_tracking.title",
  initialDate = new Date(),
  showDatePicker = true,
  historyModeDefault = false,
}: VehicleTrackingMapProps) {
  const { __ } = useTranslation();
  
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<ExtendedVehicleLocationResource[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ExtendedVehicleLocationResource | null>(null);
  const [showAllPoints, setShowAllPoints] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [historyMode, setHistoryMode] = useState<boolean>(historyModeDefault);
  const [followCamera, setFollowCamera] = useState<boolean>(true);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 2.3522, // Default to center of France
    latitude: 46.2276,
    zoom: 5,
    bearing: 0,
    pitch: 0,
  });

  // Add a new state variable to track if playback has been started
  const [playbackInitiated, setPlaybackInitiated] = useState<boolean>(false);

  // Add a state to store the historical activities
  const [activityChanges, setActivityChanges] = useState<ActivityChangeResource[]>([]);

  // Fetch current location and route data for the vehicle
  const fetchVehicleData = async () => {
    if (historyMode) {
      await fetchRouteData();
    } else {
      await fetchCurrentLocation();
    }
  };
  
  // Fetch just the current location
  const fetchCurrentLocation = async () => {
    try {
      setLoading(true);
      // Utiliser l'action GetVehicleRouteAction avec le paramètre latest=true
      // pour récupérer uniquement la dernière position
      const today = formatDate(new Date(), 'yyyy-MM-dd');
      const response = await fetch(route('vehicles.route', { 
        vehicle: vehicle.id,
        date: today,
        latest: true,
        include_activity: true // Also include activity for current location
      }));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicle location: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Vérifier si des données sont retournées
      if (data && data.length > 0) {
        setLocations(data);
        
        // Set a closer zoom level for current position mode
        if (data[0]) {
          setViewState({
            longitude: data[0].longitude,
            latitude: data[0].latitude,
            zoom: 9, // Even less zoomed in for better context (was 11)
            bearing: 0,
            pitch: 0,
            transitionDuration: 1000 // Add smooth animation
          });
        }
      } else {
        setLocations([]);
      }
      
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching current location:', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch route data for the vehicle on the selected date
  const fetchRouteData = async () => {
    try {
      setLoading(true);
      const formattedDate = formatDate(selectedDate, 'yyyy-MM-dd');
      
      // Fetch route data
      const routeResponse = await fetch(route('vehicles.route', { 
        vehicle: vehicle.id, 
        date: formattedDate
      }));
      
      if (!routeResponse.ok) {
        throw new Error(`Failed to fetch route data: ${routeResponse.statusText}`);
      }
      
      const routeData = await routeResponse.json();
      setLocations(routeData || []);
      
      // Fetch activity changes for the same day
      const activityResponse = await fetch(route('vehicles.activity_changes', {
        vehicle: vehicle.id,
        date: formattedDate
      }));
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityChanges(activityData || []);
        console.log("Fetched activity changes:", activityData);
      }
      
      setPlaybackIndex(0);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching route data:', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Refresh the data when needed
  useEffect(() => {
    fetchVehicleData();
    
    // Set up auto-refresh every minute
    const intervalId = setInterval(fetchVehicleData, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedDate, vehicle.id, historyMode]);

  // Animation effect for playback
  useEffect(() => {
    if (isPlaying && locations.length > 0 && playbackIndex < locations.length - 1) {
      const animate = (timestamp: number) => {
        if (!lastUpdateTimeRef.current) {
          lastUpdateTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - lastUpdateTimeRef.current;
        const playbackInterval = 1000 / (playbackSpeed * 4); // Adjust for smoother playback
        
        if (elapsed > playbackInterval) {
          lastUpdateTimeRef.current = timestamp;
          setPlaybackIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            if (newIndex >= locations.length - 1) {
              setIsPlaying(false);
              return locations.length - 1;
            }
            
            // Update camera position to follow the current position
            if (followCamera) {
              const currentLocation = locations[newIndex];
              if (currentLocation) {
                setViewState({
                  longitude: currentLocation.longitude,
                  latitude: currentLocation.latitude,
                  zoom: 9, // Use a less zoomed-in level (was 11)
                  bearing: viewState.bearing,
                  pitch: viewState.pitch,
                  transitionDuration: 300 // Smooth transition
                });
              }
            }
            
            return newIndex;
          });
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
  }, [isPlaying, playbackIndex, locations, playbackSpeed, viewState.zoom, viewState.bearing, viewState.pitch, followCamera]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);
  
  // Get the points to display based on the current mode
  const getDisplayPoints = () => {
    // In current location mode, return all location points
    if (!historyMode) {
      return locations;
    }
    
    // In history mode with playback:
    if (isPlaying || playbackInitiated) {
      // During playback or after starting playback (even if paused), 
      // show only points up to the current position to visualize progress
      return locations.slice(0, playbackIndex + 1);
    } else if (showAllPoints || locations.length <= 2) {
      // If explicitly showing all points or there are only a few points,
      // show the entire path
      return locations;
    } else {
      // Default behavior (before initiating playback):
      // Only return start and end points for a cleaner map
      return [locations[0], locations[locations.length - 1]];
    }
  };

  const displayPoints = getDisplayPoints();
  
  // Create GeoJSON for the route path
  const createRouteGeoJSON = () => {
    if (locations.length <= 1) {
      return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [[0, 0], [0, 0]] // Dummy coordinates for empty path
        }
      };
    }
    
    // If playback has been initiated (playing or paused), only show the path up to the current playback position
    if (historyMode && playbackInitiated) {
      const pointsToShow = locations.slice(0, playbackIndex + 1);
      return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: pointsToShow.map(loc => [loc.longitude, loc.latitude])
        }
      };
    }
    
    // Show the complete path
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: locations.map(loc => [loc.longitude, loc.latitude])
      }
    };
  };
  
  // Playback control handlers
  const togglePlayback = () => {
    if (!isPlaying) {
      setPlaybackInitiated(true);
    }
    setIsPlaying(!isPlaying);
    lastUpdateTimeRef.current = 0;
  };
  
  const jumpToStart = () => {
    setIsPlaying(false);
    setPlaybackInitiated(true);
    setPlaybackIndex(0);
    
    // Move camera to the start position
    if (followCamera && locations.length > 0) {
      setViewState({
        longitude: locations[0].longitude,
        latitude: locations[0].latitude,
        zoom: 9, // Less zoomed-in (was 11)
        bearing: viewState.bearing,
        pitch: viewState.pitch,
        transitionDuration: 500
      });
    }
  };
  
  const jumpToEnd = () => {
    setIsPlaying(false);
    setPlaybackInitiated(true);
    const lastIndex = locations.length - 1;
    setPlaybackIndex(lastIndex);
    
    // Move camera to the end position
    if (followCamera && locations.length > 0) {
      setViewState({
        longitude: locations[lastIndex].longitude,
        latitude: locations[lastIndex].latitude,
        zoom: 9, // Less zoomed-in (was 11)
        bearing: viewState.bearing,
        pitch: viewState.pitch,
        transitionDuration: 500
      });
    }
  };
  
  // Timeline slider change handler
  const handleTimelineChange = (value: number[]) => {
    setPlaybackIndex(value[0]);
    setPlaybackInitiated(true);
    
    // When manually changing the timeline, update the map view to focus on that position
    if (followCamera && locations[value[0]]) {
      setViewState({
        longitude: locations[value[0]].longitude,
        latitude: locations[value[0]].latitude,
        zoom: viewState.zoom, // Keep current zoom level
        bearing: viewState.bearing,
        pitch: viewState.pitch,
        transitionDuration: 500 // Slightly longer transition for manual changes
      });
    }
    
    setIsPlaying(false);
  };
  
  // Get current location info for display
  const getCurrentTimeDisplay = () => {
    if (locations.length === 0 || !locations[playbackIndex]) {
      return "";
    }
    return formatTime(locations[playbackIndex].recorded_at);
  };
  
  // Toggle history mode handler
  const toggleHistoryMode = () => {
    setHistoryMode(prev => !prev);
    setIsPlaying(false);
    setPlaybackInitiated(false);
    setSelectedPoint(null);
  };
  
  // Update the helper function to find the active activity at a specific time
  const getActivityAtTime = (timestamp: string | null) => {
    if (!timestamp || !activityChanges || activityChanges.length === 0) {
      return vehicle.current_working_session?.activity;
    }
    
    // Convert the timestamp to a Date object for comparison
    const pointTime = new Date(timestamp);
    
    // Find the latest activity change that occurred before or at the given timestamp
    let latestActivityChange = null;
    
    for (const change of activityChanges) {
      if (!change.recorded_at) continue;
      
      const changeTime = new Date(change.recorded_at);
      
      if (changeTime <= pointTime && (!latestActivityChange || 
          (latestActivityChange.recorded_at && 
           changeTime > new Date(latestActivityChange.recorded_at)))) {
        latestActivityChange = change;
      }
    }
    
    return latestActivityChange?.activity || vehicle.current_working_session?.activity;
  };

  // Fix TypeScript errors for vehicle with activity - add proper type handling
  const createVehicleWithActivity = (baseVehicle: VehicleResource, locationPoint: ExtendedVehicleLocationResource, activityData?: ActivityResource) => {
    // Create a copy that TypeScript will accept
    const vehicleWithActivity = {
      ...baseVehicle,
      current_location: {
        ...locationPoint,
        moving: locationPoint.moving,
        ignition: locationPoint.ignition,
        heading: locationPoint.heading || 0,
      }
    };
    
    // Only set the activity if it exists
    if (activityData && baseVehicle.current_working_session) {
      // Using type assertion to help TypeScript understand the structure
      vehicleWithActivity.current_working_session = {
        ...baseVehicle.current_working_session,
        activity: activityData
      } as typeof baseVehicle.current_working_session;
    }
    
    return vehicleWithActivity;
  };

  // Map markers setup
  const renderMapElements = () => {
    return (
      <>
        {/* Route Line - only show in history mode */}
        {historyMode && locations.length > 1 && (
          <Source id="route-direction" type="geojson" data={createRouteGeoJSON()}>
            {/* Outer glow for the route */}
            <Layer
              id="route-direction-outer"
              type="line"
              source="route-direction"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#2563eb', // Blue
                'line-width': 8,
                'line-opacity': 0.3,
                'line-blur': 3
              }}
            />
            {/* Inner line for the route */}
            <Layer
              id="route-direction-inner"
              type="line"
              source="route-direction"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#60a5fa', // Lighter blue
                'line-width': 3,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
        
        {/* Current playback position marker (in history mode) */}
        {historyMode && playbackInitiated && locations.length > 0 && locations[playbackIndex] && (
          <Marker
            key="current-playback"
            longitude={locations[playbackIndex].longitude}
            latitude={locations[playbackIndex].latitude}
            anchor="center"
          >
            {(() => {
              const activity = getActivityAtTime(locations[playbackIndex].recorded_at);
              // Create vehicle with properly typed working session
              return (
                <VehicleIcon 
                  vehicle={createVehicleWithActivity(vehicle, locations[playbackIndex], activity)}
                  size={30}
                  isSelected={true}
                />
              );
            })()}
          </Marker>
        )}
        
        {/* Location markers */}
        {displayPoints.map((point, index) => {
          const isStartPoint = index === 0;
          const isEndPoint = index === displayPoints.length - 1;
          const isNormalPoint = !isStartPoint && !isEndPoint;
          const isCurrentPoint = historyMode && playbackInitiated && point.id === locations[playbackIndex]?.id;
          
          // In current location mode, just show the vehicle icon
          if (!historyMode) {
            return (
              <Marker
                key={`point-${point.id}`}
                longitude={point.longitude}
                latitude={point.latitude}
                anchor="center"
                onClick={() => setSelectedPoint(point)}
              >
                <VehicleIcon 
                  vehicle={{
                    ...vehicle,
                    current_location: {
                      ...point,
                      moving: point.moving,
                      ignition: point.ignition,
                      heading: point.heading || 0,
                    },
                    // Use current activity for current mode
                  }}
                  isSelected={Boolean(selectedPoint)}
                  onClick={() => setSelectedPoint(point)}
                />
              </Marker>
            );
          }
          
          // Skip intermediate points if not showing all points
          if (isNormalPoint && !showAllPoints && !isPlaying) {
            return null;
          }
          
          // Skip the current point in history mode as it's already shown with the VehicleIcon
          if (isCurrentPoint) {
            return null;
          }
          
          // Always show VehicleIcon for the end point (latest location) in history mode
          // but only if it's not already showing as the current point
          if (isEndPoint && !isCurrentPoint && (!playbackInitiated || playbackIndex < locations.length - 1)) {
            return (
              <Marker
                key={`point-${point.id}`}
                longitude={point.longitude}
                latitude={point.latitude}
                anchor="center"
                onClick={() => setSelectedPoint(point)}
              >
                {(() => {
                  const activity = getActivityAtTime(point.recorded_at);
                  // Create vehicle with properly typed working session
                  return (
                    <VehicleIcon 
                      vehicle={createVehicleWithActivity(vehicle, point, activity)}
                      isSelected={selectedPoint?.id === point.id}
                      size={30}
                      onClick={() => setSelectedPoint(point)}
                    />
                  );
                })()}
              </Marker>
            );
          }
          
          // Show appropriate marker for other points
          let markerColor = '#6b7280'; // Default gray
          
          if (isStartPoint) {
            markerColor = '#2563eb'; // Start point blue
          } else if (point.moving) {
            markerColor = '#16a34a'; // Moving point green
          } else if (point.ignition) {
            markerColor = '#f59e0b'; // Idling point yellow
          }
          
          return (
            <Marker
              key={`point-${point.id}`}
              longitude={point.longitude}
              latitude={point.latitude}
              anchor="center"
              onClick={() => setSelectedPoint(point)}
            >
              <div 
                className={cn(
                  "rounded-full border-2 border-white shadow-md transition-all",
                  (isStartPoint) ? "w-4 h-4" : "w-3 h-3"
                )}
                style={{ backgroundColor: markerColor }}
              />
            </Marker>
          );
        })}
        
        {/* Popup for selected point */}
        {selectedPoint && (
          <Popup
            longitude={selectedPoint.longitude}
            latitude={selectedPoint.latitude}
            anchor="bottom"
            onClose={() => setSelectedPoint(null)}
            closeOnClick={false}
            className="z-20 p-0 -translate-y-2 translate-x-3.5"
            maxWidth="300px"
          >
            <div className="p-3 max-w-xs relative bg-background rounded-md">
              {/* Custom close button */}
              <button 
                className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-50"
                onClick={() => setSelectedPoint(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
              
              {/* Header with time and date */}
              <div className="mb-3 pr-5">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium">{formatTime(selectedPoint.recorded_at)}</h4>
                  <span className="text-xs text-muted-foreground">{formatDate(selectedPoint.recorded_at, 'DATE_MED')}</span>
                </div>
                
                {!historyMode && (
                  <Link 
                    href={route('vehicles.show', { vehicle: vehicle.id })} 
                    className="block mt-2"
                  >
                    <LicensePlate registration={vehicle.registration} />
                  </Link>
                )}
                
                {vehicle.vehicle_model?.vehicle_brand && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="inline-flex items-center">
                      {vehicle.vehicle_model.vehicle_brand.name} {vehicle.vehicle_model.name}
                      {vehicle.type && (
                        <span className="ml-1 text-muted-foreground/80">
                          • {vehicle.type.name}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
              </div>
              
              {/* All status badges grouped together */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {/* Speed badge */}
                <Badge variant="outline" className="text-xs">
                  {selectedPoint.speed} {__("vehicles.map.km_per_hour")}
                </Badge>
                
                {/* Ignition status badge */}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", 
                    selectedPoint.ignition 
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  )}
                >
                  {selectedPoint.ignition 
                    ? __("vehicles.messages.ignition_on") 
                    : __("vehicles.messages.ignition_off")}
                </Badge>
                
                {/* Moving status badge */}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs",
                    selectedPoint.moving
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  )}
                >
                  {selectedPoint.moving 
                    ? __("vehicles.messages.moving_state") 
                    : __("vehicles.messages.stationary")}
                </Badge>
              </div>
              
              {/* Address if available */}
              {selectedPoint.address && (
                <div className="flex items-start gap-2 text-xs mb-3 px-0.5 py-1.5 bg-muted/30 rounded-sm">
                  <span className="flex-1 text-muted-foreground">{selectedPoint.address}</span>
                </div>
              )}
              
              {/* Coordinates */}
              <div className="text-xs text-muted-foreground opacity-75">
                {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
              </div>
            </div>
          </Popup>
        )}
      </>
    );
  };
  
  // Return the map card component
  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">{__(title)}</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* History mode toggle */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleHistoryMode}
                className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 text-xs"
              >
                {historyMode ? (
                  <>
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">{__("vehicles.map.current_position")}</span>
                    <span className="sm:hidden">{__("vehicles.map.current")}</span>
                  </>
                ) : (
                  <>
                    <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">{__("vehicles.map.history_mode")}</span>
                    <span className="sm:hidden">{__("vehicles.map.history")}</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Date picker - only show in history mode if enabled */}
            {historyMode && showDatePicker && (
              <div className="hidden sm:block">
                <DatePicker
                  date={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </CardTitle>
        
        {/* Mobile date picker - show below title on mobile */}
        {historyMode && showDatePicker && (
          <div className="mt-2 sm:hidden">
            <DatePicker
              date={selectedDate}
              onSelect={setSelectedDate}
              disabled={loading}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-md">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="text-lg font-medium">{__("common.error")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchVehicleData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {__("common.retry")}
            </Button>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="h-[300px] sm:h-[400px] relative">
              <BaseMap
                initialRefreshInterval={60}
                showFullscreenOption={true}
                showRefreshButton={true}
                showResetViewButton={true}
                showStyleSelector={true}
                onRefresh={fetchVehicleData}
                onViewStateChange={setViewState}
                lastRefresh={lastRefresh}
                showInfoPanel={false}
                stats={
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    {!historyMode && locations.length > 0 && (
                      <Badge variant="outline" className="bg-background/50 text-xs">
                        <span className="hidden sm:inline">{vehicle.registration}</span>
                        <span className="sm:hidden">{vehicle.registration.split('-')[0]}</span>
                        <span className="ml-1">
                          {vehicle.current_location?.moving 
                            ? __("vehicles.status.moving") 
                            : vehicle.current_location?.ignition 
                              ? __("vehicles.status.idling") 
                              : __("vehicles.status.parked")}
                        </span>
                      </Badge>
                    )}
                    {historyMode && locations.length > 0 && (
                      <Badge variant="outline" className="bg-background/50 text-xs">
                        {__("vehicles.map.route_points")}: {locations.length}
                      </Badge>
                    )}
                  </div>
                }
                longitude={viewState.longitude}
                latitude={viewState.latitude}
                zoom={viewState.zoom}
                bearing={viewState.bearing}
                pitch={viewState.pitch}
                ref={mapRef}
              >
                {renderMapElements()}
                
                {loading && (
                  <div className="absolute top-3 left-3 bg-background/85 backdrop-blur-sm p-1.5 sm:p-2 rounded-md shadow-md text-xs sm:text-sm flex items-center">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </div>
                )}
              </BaseMap>
            </div>

            {/* Playback controls - only show in history mode */}
            {historyMode && locations.length > 0 && (
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={jumpToStart} 
                      disabled={playbackIndex === 0}
                    >
                      <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    
                    <Button
                      variant={isPlaying ? "default" : "outline"}
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={togglePlayback}
                      disabled={locations.length <= 1}
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={jumpToEnd}
                      disabled={playbackIndex === locations.length - 1}
                    >
                      <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">{getCurrentTimeDisplay()}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllPoints(!showAllPoints)}
                      className="ml-1 sm:ml-2 h-6 sm:h-7 text-xs px-2"
                      disabled={isPlaying}
                    >
                      <MapPin className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">
                        {showAllPoints ? __("vehicles.map.hide_points") : __("vehicles.map.show_all_points")}
                      </span>
                      <span className="sm:hidden">
                        {showAllPoints ? "Hide" : "Show"}
                      </span>
                    </Button>
                    
                    {/* Camera follow button - controls whether the map view follows the vehicle during playback */}
                    <Button
                      variant={followCamera ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFollowCamera(!followCamera)}
                      className="ml-1 h-6 sm:h-7 text-xs px-2"
                      disabled={isPlaying && !followCamera}
                    >
                      <Navigation2 className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">
                        {followCamera ? __("vehicles.map.disable_camera_follow") : __("vehicles.map.enable_camera_follow")}
                      </span>
                      <span className="sm:hidden">
                        {followCamera ? "Fixed" : "Follow"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <div className="pt-1 sm:pt-2">
                  <Slider
                    value={[playbackIndex]}
                    max={locations.length - 1}
                    step={1}
                    onValueChange={handleTimelineChange}
                    disabled={locations.length <= 1}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <div>
                    {locations.length > 0 && formatTime(locations[0].recorded_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="hidden sm:inline">{__("vehicles.map.speed")}:</span>
                    <Button
                      variant="link"
                      onClick={() => setPlaybackSpeed(1)}
                      className={cn(
                        "h-4 px-1 text-xs",
                        playbackSpeed === 1 ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      1x
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setPlaybackSpeed(2)}
                      className={cn(
                        "h-4 px-1 text-xs",
                        playbackSpeed === 2 ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      2x
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setPlaybackSpeed(4)}
                      className={cn(
                        "h-4 px-1 text-xs",
                        playbackSpeed === 4 ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      4x
                    </Button>
                  </div>
                  <div>
                    {locations.length > 0 && locations.length > 1 && formatTime(locations[locations.length - 1].recorded_at)}
                  </div>
                </div>
              </div>
            )}
            
            {/* Route stats - only show in history mode and hide some on mobile */}
            {historyMode && locations.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground mr-1">{__("vehicles.map.total_points")}:</span>
                  <span className="font-medium">{locations.length}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground mr-1">{__("vehicles.map.start_time")}:</span>
                  <span className="font-medium">{formatTime(locations[0].recorded_at)}</span>
                </div>
                
                {locations.length > 1 && (
                  <div className="hidden sm:block">
                    <span className="text-muted-foreground mr-1">{__("vehicles.map.end_time")}:</span>
                    <span className="font-medium">{formatTime(locations[locations.length - 1].recorded_at)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Single left-aligned refresh info for both modes */}
            <div className="mt-2 text-xs text-left text-muted-foreground">
              <span className="hidden sm:inline">{__("vehicles.map.last_updated")}: {formatDate(lastRefresh, 'TIME')}</span>
              <span className="sm:hidden">Updated: {formatDate(lastRefresh, 'TIME')}</span>
              <span className="mx-1">•</span> 
              <span className="hidden sm:inline">{__("vehicles.map.auto_refresh")}: 60s</span>
              <span className="sm:hidden">Auto: 60s</span>
            </div>

            {/* Show the activity at the selected point's time */}
            {historyMode && selectedPoint?.recorded_at && (
              <div className="mt-2">
                <Badge className="px-2 py-0.5 text-xs">
                  {__(`vehicles.activity.${getActivityAtTime(selectedPoint.recorded_at)?.name?.toLowerCase() || 'unknown'}`)}
                </Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 