import React, { useState } from "react";
import { type BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useTranslation } from "@/utils/translation";
import { Calendar as CalendarIcon, Map, FilterIcon, Clock } from "lucide-react";
import { PageProps } from "@/types";
import { format, parseISO, isValid, differenceInSeconds, Locale } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import DevicesLayout from "@/layouts/devices/layout";
import HeadingSmall from "@/components/heading-small";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VehicleLocationMap, { LocationPoint } from "@/components/maps/vehicle-location-map";
import { type Device } from "@/pages/devices/show";

interface DeviceMessage {
  id: number;
  device_id: string;
  message: Record<string, unknown>;
  ip: string;
  processed_at: string;
  created_at: string;
  updated_at: string;
  location?: VehicleLocation | null;
  device_message_id: string;
}

interface VehicleLocation {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  satellites: number;
  ignition: boolean;
  moving: boolean;
  altitude: number;
  address: string | null;
  address_details: Record<string, unknown> | null;
  recorded_at: string;
  device_message_id: string;
}

interface DeviceMessagesPageProps extends PageProps {
  device: Device;
  messages: {
    data: DeviceMessage[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  groupedDates: string[];
  filters: {
    date: string | null;
    per_page: number;
  };
  allLocations: LocationPoint[];
}

export default function DeviceMessages({ device, messages, filters, allLocations }: DeviceMessagesPageProps) {
  const { __ } = useTranslation();

  // Locale mapping for date-fns
  const dateFnsLocales: Record<string, Locale> = {
    en: enUS,
    fr: fr,
  };
  // Determine current locale for date-fns (simplified, assuming appLocale is like 'en', 'fr')
  // TODO: Enhance locale detection if appLocale can be more complex (e.g., 'en-US')
  const appLocaleString = document.documentElement.lang || 'fr'; 
  const dateFnsLocale = dateFnsLocales[appLocaleString.substring(0, 2)] || enUS;

  // Default to today if no date is provided
  const [date, setDate] = useState<string>(
    filters.date || format(new Date(), 'yyyy-MM-dd')
  );
  
  const [perPage, setPerPage] = useState<number>(filters.per_page || 10);

  // Filter messages by selected date
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    router.get(route("devices.messages.index", { device: device.id }), {
      date: selectedDate || null,
      per_page: perPage,
      page: 1, // Reset to first page when changing date
    }, {
      preserveState: true,
    });
  };
  
  // Handle per page change
  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value);
    setPerPage(newPerPage);
    router.get(route("devices.messages.index", { device: device.id }), {
      date,
      per_page: newPerPage,
      page: 1, // Reset to first page when changing items per page
    }, {
      preserveState: true,
    });
  };

  // Function to handle pagination
  const handlePageChange = (page: number) => {
    router.get(route("devices.messages.index", { device: device.id }), {
      date,
      per_page: perPage,
      page,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Function to format message JSON for display
  const formatMessageContent = (message: DeviceMessage) => {
    try {
      if (typeof message.message === 'object') {
        return (
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(message.message, null, 2)}
          </pre>
        );
      }
      return <span>{__("devices.messages.no_data")}</span>;
    } catch {
      return <span>Error parsing message data</span>;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const parsed = parseISO(timestamp);
    return isValid(parsed) ? format(parsed, 'ppss', { locale: dateFnsLocale }) : 'N/A';
  };
  
  // Format full timestamp
  const formatFullTimestamp = (timestamp: string) => {
    const parsed = parseISO(timestamp);
    return isValid(parsed) ? format(parsed, 'PP p', { locale: dateFnsLocale }) : 'N/A';
  };

  // Render map link for location
  const renderMapLink = (lat: number, lng: number) => {
    return (
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        <Map className="h-3 w-3" />
        <span>{__("devices.messages.view_on_map")}</span>
      </a>
    );
  };
  
  // Calculate processing time
  const calculateProcessingTime = (createdAt: string, processedAt: string | null) => {
    if (!processedAt) return null;
    
    const createdDate = parseISO(createdAt);
    const processedDate = parseISO(processedAt);

    if (!isValid(createdDate) || !isValid(processedDate)) {
      return null; 
    }
    const diff = differenceInSeconds(processedDate, createdDate);
    return diff.toFixed(2);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.breadcrumbs.show'),
      href: route('devices.show', device.id),
    },
    {
      title: __('devices.messages.title'),
      href: route('devices.messages.index', { device: device.id }),
    },
  ];


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${__("devices.messages.title")} - ${device.serial_number}`} />
      
      <DevicesLayout showSidebar={true} device={device}>
        <div className="space-y-6">
          <HeadingSmall
            title={__("devices.messages.title")}
            description={__("devices.messages.description")}
          />

          {/* Location Map */}
          <VehicleLocationMap 
            initialShowAllPoints={false}
            locations={allLocations} 
            title={__("devices.messages.vehicle_location_map")}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">{__("devices.messages.title")}</CardTitle>
                <CardDescription>
                  {messages.total} {__("devices.messages.message_count", { count: messages.total })}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={perPage.toString()} 
                    onValueChange={handlePerPageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`${perPage} ${__("common.per_page")}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 {__("common.per_page")}</SelectItem>
                      <SelectItem value="25">25 {__("common.per_page")}</SelectItem>
                      <SelectItem value="50">50 {__("common.per_page")}</SelectItem>
                      <SelectItem value="100">100 {__("common.per_page")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={date}
                    onChange={handleDateSelect}
                    className="w-44"
                  />
                </div>
              </div>
            </CardHeader>
            
            {messages.data.length === 0 ? (
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{__("devices.messages.no_messages_title")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {date 
                      ? __("devices.messages.no_messages_for_date", { date: format(parseISO(date), 'PPPP', { locale: dateFnsLocale }) }) 
                      : __("devices.messages.no_messages")}
                  </p>
                </div>
              </CardContent>
            ) : (
              <>
                <CardContent className="relative pl-6 before:absolute before:left-6 before:top-0 before:h-full before:w-[1px] before:bg-muted pt-6">
                  <div className="space-y-8">
                    {messages.data.map((message) => {
                      const processingTime = calculateProcessingTime(message.created_at, message.processed_at);
                      
                      return (
                        <div key={message.id} className="relative">
                          {/* Timeline circle and line */}
                          <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              message.location ? "bg-primary" : "bg-muted"
                            )}></div>
                          </div>
                          
                          {/* Message content */}
                          <div className="ml-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {formatTimestamp(message.created_at)}
                                </Badge>
                                {message.processed_at ? (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {__("devices.messages.processed")}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-primary/10">
                                      {processingTime}s
                                    </Badge>
                                  </div>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    {__("devices.messages.not_processed")}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {message.id}
                              </div>
                            </div>
                            
                            <Tabs defaultValue={message.location ? "location" : "message"} className="w-full">
                              <TabsList className="mb-2">
                                <TabsTrigger value="message">{__("devices.messages.message_data")}</TabsTrigger>
                                {message.location && (
                                  <TabsTrigger value="location">{__("devices.messages.location")}</TabsTrigger>
                                )}
                                <TabsTrigger value="processing">{__("devices.messages.processing_info")}</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="message" className="space-y-2">
                                {formatMessageContent(message)}
                                <div className="text-xs text-muted-foreground mt-2">
                                  <span className="font-medium">{__("devices.messages.ip")}: </span>
                                  {message.ip}
                                </div>
                              </TabsContent>
                              
                              {message.location && (
                                <TabsContent value="location" className="space-y-2">
                                  <Table>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell className="font-medium">{__("devices.messages.coordinates")}</TableCell>
                                        <TableCell>
                                          {message.location.latitude}, {message.location.longitude}
                                          <div className="mt-1">
                                            {renderMapLink(message.location.latitude, message.location.longitude)}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      
                                      <TableRow>
                                        <TableCell className="font-medium">{__("devices.messages.speed")}</TableCell>
                                        <TableCell>{message.location.speed} km/h</TableCell>
                                      </TableRow>
                                      
                                      <TableRow>
                                        <TableCell className="font-medium">{__("devices.messages.heading")}</TableCell>
                                        <TableCell>{message.location.heading}°</TableCell>
                                      </TableRow>
                                      
                                      <TableRow>
                                        <TableCell className="font-medium">{__("devices.messages.ignition")}</TableCell>
                                        <TableCell>
                                          <Badge variant={message.location.ignition ? "default" : "outline"}>
                                            {message.location.ignition 
                                              ? __("devices.messages.ignition_on") 
                                              : __("devices.messages.ignition_off")}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                      
                                      <TableRow>
                                        <TableCell className="font-medium">{__("devices.messages.moving")}</TableCell>
                                        <TableCell>
                                          <Badge variant={message.location.moving ? "default" : "outline"}>
                                            {message.location.moving 
                                              ? __("devices.messages.moving_state") 
                                              : __("devices.messages.stationary")}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                      
                                      {message.location.address && (
                                        <TableRow>
                                          <TableCell className="font-medium">{__("devices.messages.address")}</TableCell>
                                          <TableCell>{message.location.address}</TableCell>
                                        </TableRow>
                                      )}
                                      
                                      <TableRow>
                                        <TableCell className="font-medium">{__("devices.messages.recorded_at")}</TableCell>
                                        <TableCell>
                                          {format(parseISO(message.location.recorded_at), 'PP p', { locale: dateFnsLocale })}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TabsContent>
                              )}
                              
                              <TabsContent value="processing" className="space-y-2">
                                <Table>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell className="font-medium">{__("devices.messages.received_at")}</TableCell>
                                      <TableCell>{formatFullTimestamp(message.created_at)}</TableCell>
                                    </TableRow>
                                    {message.processed_at && (
                                      <>
                                        <TableRow>
                                          <TableCell className="font-medium">{__("devices.messages.processed_at")}</TableCell>
                                          <TableCell>{formatFullTimestamp(message.processed_at)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="font-medium">{__("devices.messages.processing_time")}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="bg-primary/10">
                                              {processingTime} {__("devices.messages.seconds")}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      </>
                                    )}
                                    <TableRow>
                                      <TableCell className="font-medium">{__("devices.messages.status")}</TableCell>
                                      <TableCell>
                                        {message.processed_at ? (
                                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                            {__("devices.messages.status_processed")}
                                          </Badge>
                                        ) : (
                                          <Badge variant="destructive">
                                            {__("devices.messages.status_pending")}
                                          </Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">{__("devices.messages.ip")}</TableCell>
                                      <TableCell>{message.ip}</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  {messages.last_page > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault();
                              if (messages.current_page > 1) {
                                handlePageChange(messages.current_page - 1);
                              }
                            }}
                            className={messages.current_page <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {/* First page */}
                        {messages.current_page > 3 && (
                          <PaginationItem>
                            <PaginationLink 
                              href="#" 
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handlePageChange(1);
                              }}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Ellipsis if needed */}
                        {messages.current_page > 4 && (
                          <PaginationItem>
                            <PaginationLink disabled>...</PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Page numbers around current */}
                        {Array.from({ length: messages.last_page }, (_, i) => i + 1)
                          .filter(page => 
                            page === messages.current_page - 2 || 
                            page === messages.current_page - 1 || 
                            page === messages.current_page || 
                            page === messages.current_page + 1 || 
                            page === messages.current_page + 2
                          )
                          .filter(page => page > 0 && page <= messages.last_page)
                          .map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                href="#" 
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                                isActive={page === messages.current_page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))
                        }
                        
                        {/* Ellipsis if needed */}
                        {messages.current_page < messages.last_page - 3 && (
                          <PaginationItem>
                            <PaginationLink disabled>...</PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Last page */}
                        {messages.current_page < messages.last_page - 2 && (
                          <PaginationItem>
                            <PaginationLink 
                              href="#" 
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handlePageChange(messages.last_page);
                              }}
                            >
                              {messages.last_page}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault();
                              if (messages.current_page < messages.last_page) {
                                handlePageChange(messages.current_page + 1);
                              }
                            }}
                            className={messages.current_page >= messages.last_page ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 