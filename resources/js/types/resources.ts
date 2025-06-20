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
  group_id: string | null;
  
  tenant?: TenantResource;
  user?: UserResource;
  group?: GroupResource;
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
  group_id: string | null;
  
  vehicle_model?: VehicleModelResource;
  type?: VehicleTypeResource;
  tenant?: TenantResource;
  device?: DeviceResource;
  group?: GroupResource;
  current_driver?: DriverResource;
  current_working_session?: WorkingSessionResource;
  current_location?: VehicleLocationResource;
  working_sessions?: WorkingSessionResource[];
  activity_changes?: ActivityChangeResource[];
  
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface GeofenceResource {
  id: string;
  tenant_id: string;
  group_id: string | null;
  name: string;
  geojson: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  is_active: boolean;
  
  tenant?: TenantResource;
  group?: GroupResource;
  
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

// Group Resources
export interface GroupResource {
  id: string;
  name: string;
  description: string | null;
  color: string;
  parent_id: string | null;
  tenant_id: string;
  is_active: boolean;
  
  // Computed fields
  full_path: string;
  has_children: boolean;
  can_delete: boolean;
  
  // Count fields
  children_count: number;
  vehicles_count: number;
  drivers_count: number;
  users_count: number;
  
  // Relationships
  parent?: GroupResource;
  children?: GroupResource[];
  tenant?: TenantResource;
  vehicles?: VehicleResource[];
  drivers?: DriverResource[];
  users?: UserResource[];
  
  created_at: string | null;
  updated_at: string | null;
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
// Workflow Resources
export interface WorkflowTriggerResource {
  id: string;
  workflow_id: string;
  event: string;
  conditions: Record<string, unknown>;
  is_active: boolean;
  
  workflow?: WorkflowResource;
  
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkflowConditionResource {
  id: string;
  workflow_id: string;
  field: string;
  operator: string;
  value: unknown;
  logical_operator: string;
  
  workflow?: WorkflowResource;
  
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkflowActionResource {
  id: string;
  workflow_id: string;
  action_type: string;
  parameters: Record<string, unknown>;
  order: number;
  
  workflow?: WorkflowResource;
  
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkflowExecutionResource {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  triggered_by?: string;
  duration?: number;
  
  workflow?: WorkflowResource;
  
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkflowResource {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  
  // Related data when loaded
  triggers?: WorkflowTriggerResource[];
  conditions?: WorkflowConditionResource[];
  actions?: WorkflowActionResource[];
  executions?: WorkflowExecutionResource[];
  
  // Computed attributes
  triggers_count?: number;
  conditions_count?: number;
  actions_count?: number;
  executions_count?: number;
  
  // Recent execution stats
  last_execution_at?: string | null;
  last_execution_status?: string | null;
}

// Alert Resources
export interface AlertResource {
  id: string;
  title: string;
  content: string | Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata: Record<string, unknown> | null;
  alertable_type: string;
  alertable_id: string;
  tenant_id: string | null;
  created_by_id: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  created_by?: UserResource;
  alertable?: VehicleResource | DriverResource | DeviceResource | UserResource;
}

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