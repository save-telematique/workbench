export interface CsvImportWarning {
  row: number;
  message: string;
  errors?: string[];
  ignored: boolean;
}

export interface CsvImportData {
  success: boolean;
  data: Record<string, string | number | null>[] | null;
  mapping: Record<string, string | null> | null;
  warnings: CsvImportWarning[];
  error: string | null;
}

export interface DeviceImportRow {
  device_type_id: string | number | null;
  serial_number: string | null;
  imei: string | null;
  sim_number?: string | null;
  firmware_version?: string | null;
}

export interface VehicleImportRow {
  registration: string | null;
  vin: string | null;
  vehicle_model_id: string | number | null;
  vehicle_type_id: string | number | null;
  year?: string | number | null;
  color?: string | null;
  notes?: string | null;
}

export interface DriverImportRow {
  firstname: string | null;
  surname: string | null;
  license_number: string | null;
  card_number?: string | null;
  birthdate?: string | null;
  phone?: string | null;
  card_issuing_country?: string | null;
  card_issuing_date?: string | null;
  card_expiration_date?: string | null;
}

export interface ImportStoreResult {
  success: boolean;
  created_count: number;
  errors: Array<{
    index: number;
    message: string;
  }>;
  message: string;
} 