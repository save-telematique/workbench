/**
 * Type definitions for Laravel API Resources
 * These types match the structure of resources in app/Http/Resources/
 * Update by analyzing the resources in @r
 * NOTHING ELSE SHOULD BE ADDED HERE
 */

// User Resources
export interface UserResource {
  id: number;
  name: string;
  email: string;
  locale: string;
  tenant_id: string;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  roles?: string[];
  permissions?: string[];
}

// Driver Resources
export interface DriverResource {
  id: string;
  surname: string;
  firstname: string;
  phone: string;
  license_number: string;
  card_issuing_country: string;
  card_number: string;
  birthdate: string | null;
  card_issuing_date: string | null;
  card_expiration_date: string | null;
  tenant_id: string;
  user_id: number | null;
  
  tenant?: TenantResource;
  user?: UserResource;
  working_days?: WorkingDayResource[];
  
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

// Tenant Resources
export interface TenantResource {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  
  // Only available when accessing from central app
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  svg_logo?: string | null;
}

// Device Resources
export interface DeviceTypeResource {
  id: number;
  name: string;
  manufacturer: string;
}

export interface DomainResource {
  id: number;
  domain: string;
}


export interface DeviceResource {
  id: string;
  serial_number: string;
  imei: string;
  sim_number: string;
  firmware_version: string;
  vehicle_id: string | null;
  tenant_id: string;
  last_contact_at: string | null;
  
  type?: DeviceTypeResource;
  vehicle?: VehicleResource;
  tenant?: TenantResource;
  
  created_at: string | null;
  updated_at: string | null;
}

// Data Point Resources
export interface DataPointTypeResource {
  id: number;
  name: string;
  category: string;
  type: string;
  unit: string;
  description: string;
}

export interface DataPointResource {
  value: number;
  recorded_at: string;
}

// Vehicle Resources
export interface VehicleBrandResource {
  id: number;
  name: string;
}

export interface VehicleTypeResource {
  id: number;
  name: string;
}

export interface VehicleModelResource {
  id: number;
  name: string;
  vehicle_brand?: VehicleBrandResource;
}

export interface VehicleLocationResource {
  id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  ignition: boolean;
  moving: boolean;
  altitude: number;
  address?: string;
  address_details?: Record<string, unknown>;
  recorded_at: string;
}

export interface VehicleResource {
  id: string;
  registration: string;
  vin: string;
  country: string;
  tenant_id: string;
  device_id: string | null;
  
  vehicle_model?: VehicleModelResource;
  type?: VehicleTypeResource;
  tenant?: TenantResource;
  device?: DeviceResource;
  current_driver?: DriverResource;
  current_working_session?: WorkingSessionResource;
  current_location?: VehicleLocationResource;
  working_sessions?: WorkingSessionResource[];
  activity_changes?: ActivityChangeResource[];
  
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

// Activity Resources
export interface ActivityResource {
  id: number;
  name: string;
  parent_id: number | null;
  color: string;
  
  parent?: ActivityResource;
  childrens?: ActivityResource[];
  
  created_at: string | null;
  updated_at: string | null;
}

// Working Day Resources
export interface WorkingDayResource {
  id: number;
  driver_id: string;
  date: string;
  driving_time: number;
  break_needed_in: number;
  next_break_time: number;
  remaining_driving_time: number;
  
  driver?: DriverResource;
  working_sessions?: WorkingSessionResource[];
  
  created_at: string | null;
  updated_at: string | null;
}

// Working Session Resources
export interface WorkingSessionResource {
  id: number;
  working_day_id: number;
  vehicle_id: string;
  started_at: string | null;
  ended_at: string | null;
  activity_id: number;
  type: string;
  driving_time: number;
  break_needed_in: number;
  next_break_duration: number;
  remaining_driving_time: number;
  remaining_weekly_driving_time: number;
  weekly_driving_time: number;
  weekly_exceedeed_driving_limit: boolean;
  duration?: number;
  
  working_day?: WorkingDayResource;
  vehicle?: VehicleResource;
  activity?: ActivityResource;
  driver?: DriverResource;
  
  created_at: string | null;
  updated_at: string | null;
}

// Activity Change Resources
export interface ActivityChangeResource {
  id: number;
  working_day_id: number;
  vehicle_id: string;
  recorded_at: string | null;
  activity_id: number;
  type: string;
  
  working_day?: WorkingDayResource;
  vehicle?: VehicleResource;
  activity?: ActivityResource;
  
  created_at: string | null;
  updated_at: string | null;
}

// Generic Resource Collection type
export interface ResourceCollection<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
} 