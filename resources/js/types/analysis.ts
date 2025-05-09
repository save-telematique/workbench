/**
 * Interface for vehicle analysis result data
 */
export interface VehicleAnalysisData {
  registration?: string;
  vin?: string;
  brand?: string;
  model?: string;
  brand_id?: number;
  model_id?: number;
  first_registration_date?: string;
  country?: string;
  vehicle_type?: number;
  [key: string]: string | number | undefined; // Explicitly define allowed types
}

/**
 * Interface for device analysis result data
 */
export interface DeviceAnalysisData {
  imei?: string;
  serial_number?: string;
  firmware_version?: string;
  device_type?: string;
  device_type_id?: number;
  [key: string]: string | number | undefined; // Explicitly define allowed types
}

/**
 * Interface for driver license analysis result data
 */
export interface DriverAnalysisData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  license_number?: string;
  card_number?: string;
  license_class?: string;
  issue_date?: string;
  expiry_date?: string;
  country_code?: string;
  [key: string]: string | undefined; // Driver data is all strings
}

/**
 * Union type for analysis result data
 */
export type AnalysisData = VehicleAnalysisData | DeviceAnalysisData | DriverAnalysisData; 