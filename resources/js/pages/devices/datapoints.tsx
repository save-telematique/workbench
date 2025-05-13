import React, { useState, useEffect, useRef } from "react";
import { DataPointResource, DataPointTypeResource, DeviceResource, type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/utils/translation";
import { 
  Activity, 
  CalendarIcon, 
  Clock, 
  Database,
  FilterIcon,
  RefreshCw,
  ChevronLeft,
  ChartBar,
  Hash,
  CircleDot
} from "lucide-react";
import { PageProps } from "@/types";
import { format, parseISO, isValid, subHours, subDays } from "date-fns";
import { fr as dateFnsFr, enUS, type Locale } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DevicesLayout from "@/layouts/devices/layout";
import HeadingSmall from "@/components/heading-small";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
// Import all Recharts components needed from recharts package
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis 
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";

interface DataPointExplorerPageProps extends PageProps {
  device: DeviceResource;
  dataPointTypes: DataPointTypeResource[];
  latestReadings?: Record<number, unknown>;
}

enum TimeRange {
  HOUR_1 = "1h",
  HOUR_6 = "6h",
  HOUR_12 = "12h",
  DAY_1 = "1d",
  DAY_7 = "7d",
  DAY_30 = "30d",
  CUSTOM = "custom",
}

enum AggregationType {
  NONE = "none",
  AVG = "avg",
  MIN = "min",
  MAX = "max",
  SUM = "sum",
  COUNT = "count",
}

enum ViewMode {
  CHART = "chart",
  TABLE = "table",
  LATEST = "latest",
}

export default function DeviceDataPoints({ device, dataPointTypes, latestReadings = {} }: DataPointExplorerPageProps) {
  const { __ } = useTranslation();
  
  // Add ref to track if component is mounted
  const isMounted = useRef(true);

  // Locale mapping for date-fns
  const dateFnsLocales: Record<string, Locale> = {
    en: enUS,
    fr: dateFnsFr,
  };
  const appLocaleString = document.documentElement.lang || "fr";
  const dateFnsLocale = dateFnsLocales[appLocaleString.substring(0, 2)] || enUS;

  // States
  const [selectedDataPointType, setSelectedDataPointType] = useState<DataPointTypeResource | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.HOUR_6);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE); // Default to TABLE view
  const [aggregationType, setAggregationType] = useState<AggregationType>(AggregationType.NONE);
  const [startDate, setStartDate] = useState<Date>(() => subHours(new Date(), 6));
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataPoints, setDataPoints] = useState<DataPointResource[]>([]);
  const [aggregatedData, setAggregatedData] = useState<DataPointResource[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showOnlyWithData, setShowOnlyWithData] = useState<boolean>(false);
  
  // Keep previous params for comparing state changes
  const fetchParamsRef = useRef({
    dataPointTypeId: null as number | null,
    startTime: "",
    endTime: "",
    aggregation: null as string | null
  });

  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __("devices.breadcrumbs.index"),
      href: route("devices.index"),
    },
    {
      title: __("devices.breadcrumbs.show"),
      href: route("devices.show", { device: device.id }),
    },
    {
      title: __("devices.datapoints.title"),
      href: route("devices.datapoints.index", { device: device.id }),
    },
  ];

  // Chart config for different data types
  const chartConfig = {
    value: {
      label: __("devices.datapoints.value"),
      color: "#2563eb",
    },
    average: {
      label: __("devices.datapoints.average"),
      color: "#16a34a",
    },
    min: {
      label: __("devices.datapoints.minimum"),
      color: "#dc2626",
    },
    max: {
      label: __("devices.datapoints.maximum"),
      color: "#9333ea",
    },
  };

  // Setup cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDataPoints = async () => {
    if (!selectedDataPointType) return;
    
    // Get current fetch params for this request
    const currentParams = {
      dataPointTypeId: selectedDataPointType.id,
      startTime: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
      aggregation: aggregationType !== AggregationType.NONE ? aggregationType : null
    };
    
    // Store for next comparison
    fetchParamsRef.current = currentParams;
    
    setIsLoading(true);
    
    try {
      const params = {
        data_point_type_id: currentParams.dataPointTypeId,
        start_time: currentParams.startTime,
        end_time: currentParams.endTime,
        aggregation: currentParams.aggregation,
        order: 'desc', // Always order data descending (newest first)
      };
      
      const response = await fetch(route("api.devices.datapoints", { device: device.id, ...params }), {
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      
      if (isMounted.current) {
        if (aggregationType !== AggregationType.NONE) {
          // Extract aggregated data array from response
          const aggregatedDataArray = Array.isArray(data) ? data : 
                                     (data && data.data && Array.isArray(data.data)) ? data.data : 
                                     (data && data.aggregated && Array.isArray(data.aggregated)) ? data.aggregated : [];
          
          // Format the data to match AggregatedData interface
          const formattedAggregatedData = aggregatedDataArray.map((item: Record<string, unknown>) => ({
            recorded_at: item.recorded_at || item.timestamp || item.time_group || item.timeGroup || null,
            value: typeof item.value !== 'undefined' ? parseFloat(String(item.value)) : 0
          }));
          
          setAggregatedData(formattedAggregatedData);
        } else {
          // Ensure data is sorted newest first (descending)
          const dataPointsArray = Array.isArray(data) ? data : 
                                (data && data.data && Array.isArray(data.data)) ? data.data : [];
          
          if (dataPointsArray.length > 0) {
            setDataPoints(dataPointsArray.sort((a: DataPointResource, b: DataPointResource) => {
              return new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime();
            }));
          } else {
            setDataPoints([]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data points:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Effect to fetch data when data point type or aggregation changes
  useEffect(() => {
    if (selectedDataPointType) {
      fetchDataPoints();
    }
  }, [selectedDataPointType, aggregationType]);

  // Separate effect to update date range based on time range selection
  useEffect(() => {
    // Update date range when time range changes
    if (timeRange !== TimeRange.CUSTOM) {
      const end = new Date();
      let start;
      
      switch (timeRange) {
        case TimeRange.HOUR_1:
          start = subHours(end, 1);
          break;
        case TimeRange.HOUR_6:
          start = subHours(end, 6);
          break;
        case TimeRange.HOUR_12:
          start = subHours(end, 12);
          break;
        case TimeRange.DAY_1:
          start = subDays(end, 1);
          break;
        case TimeRange.DAY_7:
          start = subDays(end, 7);
          break;
        case TimeRange.DAY_30:
          start = subDays(end, 30);
          break;
        default:
          start = subHours(end, 6);
      }
      
      setStartDate(start);
      setEndDate(end);
      
      // Don't automatically set aggregation based on time range
      // Keep current aggregation settings when changing time range
    }
  }, [timeRange]);

  // Separate effect to fetch data when date range changes
  useEffect(() => {
    // Only fetch if we have a selected data point and dates have changed
    if (selectedDataPointType) {
      const formattedStart = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      const formattedEnd = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
      
      // Check if dates have changed since last fetch
      if (
        formattedStart !== fetchParamsRef.current.startTime ||
        formattedEnd !== fetchParamsRef.current.endTime
      ) {
        // Use a short timeout to ensure state is settled
        const timeoutId = setTimeout(() => {
          if (isMounted.current) {
            fetchDataPoints();
          }
        }, 50);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [startDate, endDate, selectedDataPointType]);

  const handleDataPointTypeSelect = (dataPointType: DataPointTypeResource) => {
    setSelectedDataPointType(dataPointType);
    
    // Check if the selected data type can be charted
    const isChartable = isDataTypeChartable(dataPointType.type);
    
    // Reset aggregation to NONE for non-chartable data types
    if (!isChartable && aggregationType !== AggregationType.NONE) {
      setAggregationType(AggregationType.NONE);
    }
    
    // If it's chartable and we're not already in chart view, switch to chart view
    if (isChartable && viewMode !== ViewMode.CHART) {
      setViewMode(ViewMode.CHART);
    } else if (!isChartable && viewMode === ViewMode.CHART) {
      setViewMode(ViewMode.TABLE);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
    // Aggregation and date updates are handled in useEffect
  };

  const handleAggregationChange = (value: string) => {
    // Reset to "none" if the datatype is not chartable
    if (selectedDataPointType && !isDataTypeChartable(selectedDataPointType.type) && value !== AggregationType.NONE) {
      setAggregationType(AggregationType.NONE);
      return;
    }
    setAggregationType(value as AggregationType);
  };

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  const handleCustomDateChange = (field: "start" | "end", value: string) => {
    const date = parseISO(value);
    if (isValid(date)) {
      if (field === "start") {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setTimeRange(TimeRange.CUSTOM);
    }
  };

  const renderDataPointIcon = (dataType: string | null | undefined) => {
    if (!dataType) return <Database className="h-4 w-4" />;
    
    const type = dataType.toLowerCase();
    
    switch (type) {
      case "integer":
      case "float":
        return <Activity className="h-4 w-4" />;
      case "boolean":
        return <ChartBar className="h-4 w-4" />;
      case "string":
        return <Database className="h-4 w-4" />;
      case "json":
        return <Database className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Determine if a data type can be visualized in a chart
  const isDataTypeChartable = (dataType: string | null | undefined): boolean => {
    if (!dataType) return false;
    
    const type = String(dataType).toLowerCase().trim();
    
    // List of types that can be charted
    const chartableTypes = [
      "integer", "int", 
      "float", "double", "decimal", "number", "numeric",
      "boolean", "bool"
    ];
    
    return chartableTypes.includes(type);
  };

  const formatValue = (value: unknown, dataType: string | null | undefined) => {
    if (value === null || value === undefined) return __("devices.datapoints.no_data");
    
    // Check if dataType is undefined or null
    if (!dataType) {
      return String(value);
    }
    
    switch (dataType.toLowerCase()) {
      case "integer":
        return typeof value === "number" ? value.toString() : parseInt(String(value), 10).toString();
      case "float":
        return typeof value === "number" ? value.toFixed(2) : parseFloat(String(value)).toFixed(2);
      case "boolean":
        return value ? __("common.yes") : __("common.no");
      case "json":
        if (typeof value === "object") {
          // For JSON objects, display as formatted JSON
          return JSON.stringify(value, null, 2);
        }
        return String(value);
      default:
        return String(value);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const parsed = parseISO(timestamp);
    // Use "P p" format which includes seconds
    return isValid(parsed) ? format(parsed, "PP p:ss", { locale: dateFnsLocale }) : "N/A";
  };

  const formatChartData = () => {
    if (aggregationType !== AggregationType.NONE) {
      // Ensure aggregatedData is an array before trying to iterate it
      if (!Array.isArray(aggregatedData) || aggregatedData.length === 0) {
        return [];
      }
      
      // For aggregated data, sort by recorded_at when formatting for chart
      return [...aggregatedData]
        .sort((a, b) => {
          if (!a.recorded_at || !b.recorded_at) return 0;
          return new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime();
        })
        .map((item) => {
          // Safely extract time information
          const timeString = item.recorded_at ? format(parseISO(item.recorded_at), "HH:mm", { locale: dateFnsLocale }) : "";
          
          // Safely extract value 
          const value = typeof item.value === 'number' ? item.value : 0;
          
          return {
            time: timeString,
            value: value,
          };
        });
    }
    
    // For raw data points, we need to clone and reverse the sort for chart display
    // Charts typically expect data in chronological order (oldest to newest)
    return [...dataPoints]
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((point) => {
        let value = 0;
        
        // Handle different data types
        if (selectedDataPointType && selectedDataPointType.type) {
          const dataType = selectedDataPointType.type.toLowerCase().trim();
          
          if (dataType === "boolean" || dataType === "bool") {
            // Convert boolean values to 0 or 1 for charting
            value = point.value ? 1 : 0;
          } else if (["integer", "float", "int", "number", "decimal", "numeric"].includes(dataType)) {
            // Parse numeric values
            if (point.value === null || point.value === undefined) {
              value = 0;
            } else if (typeof point.value === "number") {
              value = point.value;
            } else {
              // Try to parse as number, defaulting to 0 if invalid
              const parsed = parseFloat(String(point.value).replace(/,/g, '.'));
              value = isNaN(parsed) ? 0 : parsed;
            }
          }
        }
        
        return {
          time: format(parseISO(point.recorded_at), "HH:mm", { locale: dateFnsLocale }),
          value: value,
          original: point.value, // Store original value for tooltip display
        };
      });
  };

  // Define interfaces for the tooltip content props
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number | string;
      dataKey: string;
      name?: string;
      color?: string;
    }>;
    label?: string;
  }
  
  const CustomTooltipContent = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {__("devices.datapoints.time")}
            </span>
            <span className="font-bold tabular-nums">{label}</span>
          </div>
          {payload.map((item, index) => (
            <div key={`tooltip-item-${index}`} className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {__("devices.datapoints.value")}
              </span>
              <span className="font-bold tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (!selectedDataPointType) {
      return null;
    }
    
    const chartData = formatChartData();
    
    const isChartable = isDataTypeChartable(selectedDataPointType.type);
    
    if (!isChartable) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-md">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{__("devices.datapoints.not_chartable")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {__("devices.datapoints.not_chartable_description")}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setViewMode(ViewMode.TABLE)}
          >
            {__("devices.datapoints.view_as_table")}
          </Button>
        </div>
      );
    }
    
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-md">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{__("devices.datapoints.no_data_title")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {__("devices.datapoints.no_data_description")}
          </p>
        </div>
      );
    }
    
    const dataType = selectedDataPointType.type ? selectedDataPointType.type.toLowerCase().trim() : '';
    const isBoolean = dataType === "boolean" || dataType === "bool";
    
    if (isBoolean) {
      return (
        <ChartContainer config={chartConfig} className="h-64 w-full mt-4">
          <RechartsBarChart 
            data={chartData} 
            margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            width={500}
            height={250}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 1]}
              ticks={[0, 1]}
              tickFormatter={(value: number) => value === 1 ? __("common.yes") : __("common.no")}
            />
            <ChartTooltip content={<CustomTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={4}
            />
          </RechartsBarChart>
        </ChartContainer>
      );
    }
    
    // For numeric types, use a line chart
    return (
      <ChartContainer config={chartConfig} className="h-64 w-full mt-4">
        <LineChart 
          data={chartData} 
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
          width={500}
          height={250}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip content={<CustomTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={true}
          />
        </LineChart>
      </ChartContainer>
    );
  };

  const renderTable = () => {
    if (!selectedDataPointType) return null;
    
    // Check if we have data to display
    if (aggregationType !== AggregationType.NONE) {
      if (!Array.isArray(aggregatedData) || aggregatedData.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-md">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{__("devices.datapoints.no_data_title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {__("devices.datapoints.no_data_description")}
            </p>
          </div>
        );
      }
    } else {
      if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-md">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{__("devices.datapoints.no_data_title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {__("devices.datapoints.no_data_description")}
            </p>
          </div>
        );
      }
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{__("devices.datapoints.timestamp")}</TableHead>
            <TableHead>{__("devices.datapoints.value")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {aggregationType !== AggregationType.NONE ? (
            aggregatedData.map((item, index) => (
              <TableRow key={`aggregated-${item.recorded_at || ''}-${index}`}>
                <TableCell>
                  {item.recorded_at ? formatTimestamp(item.recorded_at) : __("devices.datapoints.no_timestamp")}
                </TableCell>
                <TableCell>
                  {formatValue(item.value, "float")}
                  {selectedDataPointType.unit && ` ${selectedDataPointType.unit}`}
                </TableCell>
              </TableRow>
            ))
          ) : (
            dataPoints.map((point, index) => (
              <TableRow key={`${point.recorded_at}-${index}`}>
                <TableCell>{formatTimestamp(point.recorded_at)}</TableCell>
                <TableCell>
                  {typeof point.value === "object" ? (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(point.value, null, 2)}
                    </pre>
                  ) : (
                    <>
                      {formatValue(point.value, selectedDataPointType.type)}
                      {selectedDataPointType.unit && ` ${selectedDataPointType.unit}`}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  const renderLatestValue = () => {
    if (!selectedDataPointType) return null;
    
    const latestValue = latestReadings[selectedDataPointType.id];
    const latestDataPoint = dataPoints.length > 0 ? dataPoints[0] : null; // First point is the latest since we sort desc
    
    const isCompositeType = 
      selectedDataPointType.type?.toLowerCase() === "json" || 
      typeof latestValue === "object";
    
    return (
      <div className="flex flex-col items-center justify-center p-6">
        {isCompositeType ? (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{__("devices.datapoints.complex_value")}</h4>
              {latestDataPoint && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(latestDataPoint.recorded_at)}
                </div>
              )}
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-72 w-full text-left">
              {typeof latestValue === "object" 
                ? JSON.stringify(latestValue, null, 2)
                : formatValue(latestValue, selectedDataPointType.type)}
            </pre>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {__("devices.datapoints.latest_reading")}
            </p>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold mb-2">
              {latestValue !== undefined
                ? formatValue(latestValue, selectedDataPointType.type)
                : __("devices.datapoints.no_data")}
              {selectedDataPointType.unit && ` ${selectedDataPointType.unit}`}
            </div>
            {latestDataPoint && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(latestDataPoint.recorded_at)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {__("devices.datapoints.latest_reading")}
            </p>
          </>
        )}
      </div>
    );
  };

  // Filter data point types based on search query and data availability
  const filteredDataPointTypes = dataPointTypes.filter(dataPointType => {
    const query = searchQuery.toLowerCase().trim();
    const hasData = typeof latestReadings[dataPointType.id] !== 'undefined';
    
    // Filter by data availability if the checkbox is checked
    if (showOnlyWithData && !hasData) {
      return false;
    }
    
    // Apply search query filter
    if (!query) return true;
    
    return (
      (dataPointType.name ? dataPointType.name.toLowerCase().includes(query) : false) ||
      (dataPointType.description ? dataPointType.description.toLowerCase().includes(query) : false) ||
      (dataPointType.category ? dataPointType.category.toLowerCase().includes(query) : false) ||
      (dataPointType.type ? dataPointType.type.toLowerCase().includes(query) : false) ||
      (dataPointType.id ? dataPointType.id.toString().includes(query) : false)
    );
  });

  // Helper function to check if a data point type has data
  const hasDataAvailable = (dataPointTypeId: number): boolean => {
    return typeof latestReadings[dataPointTypeId] !== 'undefined';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${__("devices.datapoints.title")} - ${device.serial_number}`} />
      
      <DevicesLayout showSidebar={true} device={device}>
        <div className="space-y-2">
          <HeadingSmall
            title={__("devices.datapoints.title")}
            description={__("devices.datapoints.description")}
          />

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <Card className="md:col-span-2 pt-3 pb-0 gap-3">
              <CardHeader className="py-1 px-3">
                <CardTitle className="text-sm">{__("devices.datapoints.data_point_types")}</CardTitle>
                <div className="mt-1 space-y-2">
                  <Input
                    type="search"
                    placeholder={__("devices.datapoints.search_data_points")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-7 text-xs"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-with-data" 
                      checked={showOnlyWithData}
                      onCheckedChange={(checked) => setShowOnlyWithData(checked === true)}
                    />
                    <label
                      htmlFor="show-with-data"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {__("devices.datapoints.show_only_with_data")}
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[65vh]">
                  <div className="py-0">
                    {filteredDataPointTypes.length > 0 ? (
                      filteredDataPointTypes.map((dataPointType) => (
                        <button
                          key={`data-point-type-${dataPointType.id}`}
                          className={cn(
                            "flex items-center w-full px-2 py-1 text-left hover:bg-muted/50 transition-colors text-xs",
                            selectedDataPointType?.id === dataPointType.id && "bg-muted"
                          )}
                          onClick={() => handleDataPointTypeSelect(dataPointType)}
                        >
                          <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted shrink-0">
                              {renderDataPointIcon(dataPointType.type)}
                            </div>
                            <div className="truncate flex-1">
                              <div className="flex items-center text-[10px] text-muted-foreground mb-0.5">
                                <Hash className="h-2.5 w-2.5 mr-0.5" />
                                <span className="font-medium">{dataPointType.id}</span>
                                <span className="mx-1 text-muted-foreground/50">•</span>
                                <span>{dataPointType.type}</span>
                                {hasDataAvailable(dataPointType.id) && (
                                  <CircleDot className="ml-1 h-2.5 w-2.5 text-green-500" />
                                )}
                              </div>
                              <div className="font-medium truncate flex items-center">
                                {dataPointType.name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <Database className="h-5 w-5 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {__("devices.datapoints.no_results_found")}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-5 max-w-3xl py-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
                <div>
                  <CardTitle className="text-sm">
                    {selectedDataPointType ? selectedDataPointType.name : __("devices.datapoints.select_data_point")}
                  </CardTitle>
                  {selectedDataPointType && (
                    <CardDescription className="text-xs line-clamp-1">
                      {selectedDataPointType.description || __("devices.datapoints.no_description")}
                    </CardDescription>
                  )}
                </div>
                
                {selectedDataPointType && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      {selectedDataPointType.type}
                      {selectedDataPointType.unit && ` (${selectedDataPointType.unit})`}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fetchDataPoints();
                      }}
                      disabled={isLoading}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              {selectedDataPointType ? (
                <>
                  <CardContent className="pt-1 px-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {/* Time Range Selector */}
                      <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{__("devices.datapoints.time_range")}</span>
                        </div>
                        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder={__("devices.datapoints.select_time_range")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TimeRange.HOUR_1}>{__("devices.datapoints.last_hour")}</SelectItem>
                            <SelectItem value={TimeRange.HOUR_6}>{__("devices.datapoints.last_6_hours")}</SelectItem>
                            <SelectItem value={TimeRange.HOUR_12}>{__("devices.datapoints.last_12_hours")}</SelectItem>
                            <SelectItem value={TimeRange.DAY_1}>{__("devices.datapoints.last_24_hours")}</SelectItem>
                            <SelectItem value={TimeRange.DAY_7}>{__("devices.datapoints.last_7_days")}</SelectItem>
                            <SelectItem value={TimeRange.DAY_30}>{__("devices.datapoints.last_30_days")}</SelectItem>
                            <SelectItem value={TimeRange.CUSTOM}>{__("devices.datapoints.custom_range")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Aggregation Selector */}
                      <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{__("devices.datapoints.aggregation")}</span>
                        </div>
                        <Select 
                          value={aggregationType} 
                          onValueChange={handleAggregationChange}
                          disabled={!selectedDataPointType || (selectedDataPointType && !isDataTypeChartable(selectedDataPointType.type))}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder={__("devices.datapoints.select_aggregation")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AggregationType.NONE}>{__("devices.datapoints.no_aggregation")}</SelectItem>
                            <SelectItem value={AggregationType.AVG}>{__("devices.datapoints.average")}</SelectItem>
                            <SelectItem value={AggregationType.MIN}>{__("devices.datapoints.minimum")}</SelectItem>
                            <SelectItem value={AggregationType.MAX}>{__("devices.datapoints.maximum")}</SelectItem>
                            <SelectItem value={AggregationType.SUM}>{__("devices.datapoints.sum")}</SelectItem>
                            <SelectItem value={AggregationType.COUNT}>{__("devices.datapoints.count")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* View Mode Selector */}
                      <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                        <div className="flex items-center gap-1 mb-0.5">
                          <FilterIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{__("devices.datapoints.view_mode")}</span>
                        </div>
                        <Select 
                          value={viewMode} 
                          onValueChange={handleViewModeChange}
                          disabled={!selectedDataPointType}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder={__("devices.datapoints.select_view_mode")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem 
                              value={ViewMode.CHART}
                              disabled={!selectedDataPointType || (selectedDataPointType && !isDataTypeChartable(selectedDataPointType.type))}
                            >
                              {__("devices.datapoints.chart_view")}
                            </SelectItem>
                            <SelectItem value={ViewMode.TABLE}>
                              {__("devices.datapoints.table_view")}
                            </SelectItem>
                            <SelectItem value={ViewMode.LATEST}>
                              {__("devices.datapoints.latest_view")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Custom Date Range */}
                    {timeRange === TimeRange.CUSTOM && (
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-0.5">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{__("devices.datapoints.start_date")}</span>
                          </div>
                          <Input
                            type="datetime-local"
                            value={format(startDate, "yyyy-MM-dd'T'HH:mm")}
                            onChange={(e) => handleCustomDateChange("start", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-0.5">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{__("devices.datapoints.end_date")}</span>
                          </div>
                          <Input
                            type="datetime-local"
                            value={format(endDate, "yyyy-MM-dd'T'HH:mm")}
                            onChange={(e) => handleCustomDateChange("end", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <ScrollArea className="h-[60vh]">
                          {viewMode === ViewMode.CHART && (
                            <div className="chart-container">
                              {renderChart()}
                            </div>
                          )}
                          {viewMode === ViewMode.TABLE && (
                            <div className="table-container">
                              {renderTable()}
                            </div>
                          )}
                          {viewMode === ViewMode.LATEST && (
                            <div className="latest-container">
                              {renderLatestValue()}
                            </div>
                          )}
                        </ScrollArea>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="pt-1 px-3">
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Database className="h-6 w-6 text-muted-foreground mb-2" />
                    <h3 className="text-sm font-medium">{__("devices.datapoints.no_selection_title")}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {__("devices.datapoints.no_selection_description")}
                    </p>
                    <div className="flex items-center mt-2">
                      <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{__("devices.datapoints.select_from_sidebar")}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 