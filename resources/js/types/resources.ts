/**
 * Type definitions for Laravel API Resources
 * These types match the structure of resources in app/Http/Resources/
 * NOTHING ELSE SHOULD BE ADDED HERE
 */

// Tenant Resources
export interface TenantResource {
  id: string;
  name: string;
}

// Device Resources
export interface DeviceTypeResource {
  id: number;
  name: string;
  manufacturer: string;
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
  brand?: VehicleBrandResource;
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
  
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
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