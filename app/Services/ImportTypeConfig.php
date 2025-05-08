<?php

namespace App\Services;

use App\Services\Import\ImporterInterface;
use App\Services\Import\DeviceImporter;
use App\Services\Import\VehicleImporter;
use App\Services\Import\DriverImporter;
use InvalidArgumentException;

/**
 * Configuration class for different import types
 */
class ImportTypeConfig
{
    /**
     * Get the importer handler for a specific import type.
     *
     * @param string $type The import type (e.g., 'device', 'vehicle', 'driver')
     * @return ImporterInterface
     * @throws InvalidArgumentException If the type is not configured
     */
    public static function getHandler(string $type): ImporterInterface
    {
        switch ($type) {
            case 'device':
                return new DeviceImporter();
            case 'vehicle':
                // To be created in a later step
                // return new VehicleImporter(); 
                // For now, let's throw to avoid issues if called prematurely
                // Will be replaced once VehicleImporter is defined
                if (!class_exists(VehicleImporter::class)) {
                    throw new InvalidArgumentException("VehicleImporter class not yet defined.");
                }
                return new VehicleImporter();
            case 'driver':
                // To be created in a later step
                // return new DriverImporter(); 
                // For now, let's throw to avoid issues if called prematurely
                // Will be replaced once DriverImporter is defined
                if (!class_exists(DriverImporter::class)) {
                    throw new InvalidArgumentException("DriverImporter class not yet defined.");
                }
                return new DriverImporter();
            default:
                throw new InvalidArgumentException("Import type '{$type}' is not configured with a handler.");
        }
    }

    /**
     * Get all available import types with their friendly names.
     *
     * @return array ['type' => 'Friendly Name']
     */
    public static function getAvailableImportTypes(): array
    {
        // This can be expanded as more importers are added
        // Or made dynamic if importers can register themselves
        $types = [
            'device' => 'Devices',
            'vehicle' => 'Vehicles',
            'driver' => 'Drivers',
        ];
        
        // Optionally, verify that handlers exist for these types
        // foreach (array_keys($types) as $type) {
        //     try {
        //         self::getHandler($type); 
        //     } catch (InvalidArgumentException $e) {
        //         // Log or handle types listed in getAvailableImportTypes but without a handler
        //         unset($types[$type]); // Or throw an error during startup
        //     }
        // }
        return $types;
    }

    /**
     * Get configuration for all import types
     */
    public static function getAllConfigs(): array
    {
        return [
            'device' => self::getDeviceConfig(),
            'vehicle' => self::getVehicleConfig(),
            'driver' => self::getDriverConfig(),
        ];
    }

    /**
     * Get configuration for a specific import type
     */
    public static function getConfig(string $type): array
    {
        $configs = self::getAllConfigs();
        
        if (!isset($configs[$type])) {
            throw new \InvalidArgumentException("Import type '{$type}' is not configured");
        }
        
        return $configs[$type];
    }

    /**
     * Get device import configuration
     */
    private static function getDeviceConfig(): array
    {
        return [
            'model' => \App\Models\Device::class,
            'permission' => 'create_devices',
            'request_array_name' => 'devices',
            'inertia_page' => 'devices/import',
            'target_fields' => [
                'device_type_id' => 'Device Type (required)',
                'serial_number' => 'Serial Number (required)',
                'imei' => 'IMEI Number (required)',
                'sim_number' => 'SIM Number (optional)',
                'firmware_version' => 'Firmware Version (optional)',
            ],
            'mandatory_fields' => ['device_type_id', 'serial_number', 'imei'],
            'unique_field' => 'imei',
            'validation_rules' => [
                'device_type_id' => 'required',
                'serial_number' => 'required|string|max:255',
                'imei' => 'required|string|max:255|unique:devices,imei',
                'sim_number' => 'nullable|string|max:255',
                'firmware_version' => 'nullable|string|max:255',
            ],
            'foreign_keys' => [
                'device_type_id' => [
                    'model' => \App\Models\DeviceType::class,
                    'field' => 'name',
                    'id_field' => 'id',
                ],
            ],
            'context' => function () {
                // Get device types from the database for context
                $deviceTypes = \App\Models\DeviceType::all()->pluck('name')->implode(', ');
                
                return "These are device records for telematics devices. The IMEI is a unique 15-digit identifier. " .
                       "Serial Number is another identifier often printed on the device. " . 
                       "Available device types are: $deviceTypes";
            },
        ];
    }

    /**
     * Get vehicle import configuration
     */
    private static function getVehicleConfig(): array
    {
        return [
            'model' => \App\Models\Vehicle::class,
            'permission' => 'create_vehicles',
            'request_array_name' => 'vehicles',
            'inertia_page' => 'vehicles/import',
            'target_fields' => [
                'registration' => 'Registration Number/License Plate (required)',
                'vin' => 'VIN - Vehicle Identification Number (required)',
                'vehicle_model_id' => 'Vehicle Model (required)',
                'vehicle_type_id' => 'Vehicle Type (required)',
                'year' => 'Manufacturing Year (optional)',
                'color' => 'Color (optional)',
                'notes' => 'Notes (optional)',
            ],
            'mandatory_fields' => ['registration', 'vin', 'vehicle_model_id', 'vehicle_type_id'],
            'unique_field' => 'registration',
            'validation_rules' => [
                'registration' => 'required|string|max:255|unique:vehicles,registration',
                'vin' => 'required|string|max:255',
                'vehicle_model_id' => 'required|exists:vehicle_models,id',
                'vehicle_type_id' => 'required|exists:vehicle_types,id',
                'notes' => 'nullable|string|max:1000',
            ],
            'foreign_keys' => [
                'vehicle_model_id' => [
                    'model' => \App\Models\VehicleModel::class,
                    'field' => 'name',
                    'id_field' => 'id',
                    'relation' => 'vehicleBrand',
                    'combined_with' => 'vehicle_brand_id',
                    'combined_field' => 'name',
                ],
                'vehicle_type_id' => [
                    'model' => \App\Models\VehicleType::class,
                    'field' => 'name',
                    'id_field' => 'id',
                ],
            ],
            'context' => function () {
                // Get vehicle types and models for context
                $vehicleTypes = \App\Models\VehicleType::all()->pluck('name')->implode(', ');
                $vehicleBrands = \App\Models\VehicleBrand::with('models')->get();
                
                $modelsContext = '';
                foreach ($vehicleBrands as $brand) {
                    $models = $brand->models->pluck('name')->implode(', ');
                    $modelsContext .= "Brand: {$brand->name}, Models: $models; ";
                }
                
                return "These are vehicle records. The registration is the license plate. " .
                       "VIN is a 17-character vehicle identification number. " . 
                       "Available vehicle types are: $vehicleTypes. " .
                       "Available vehicle brands and models are: $modelsContext";
            },
        ];
    }

    /**
     * Get driver import configuration
     */
    private static function getDriverConfig(): array
    {
        return [
            'model' => \App\Models\Driver::class,
            'permission' => 'create_drivers',
            'request_array_name' => 'drivers',
            'inertia_page' => 'drivers/import',
            'target_fields' => [
                'firstname' => 'First Name (required)',
                'surname' => 'Last Name/Surname (required)',
                'license_number' => 'Driver License Number (required)',
                'card_number' => 'Driver Card Number (optional)',
                'birthdate' => 'Date of Birth (optional)',
                'phone' => 'Phone Number (optional)',
                'card_issuing_country' => 'Country Code (optional)',
                'card_issuing_date' => 'License Issue Date (optional)',
                'card_expiration_date' => 'License Expiry Date (optional)',
            ],
            'mandatory_fields' => ['firstname', 'surname', 'license_number'],
            'unique_field' => 'license_number',
            'validation_rules' => [
                'firstname' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'license_number' => 'required|string|max:255|unique:drivers,license_number',
                'card_number' => 'nullable|string|max:255',
                'birthdate' => 'nullable|date',
                'phone' => 'nullable|string|max:255',
                'card_issuing_country' => 'nullable|string|max:2',
                'card_issuing_date' => 'nullable|date',
                'card_expiration_date' => 'nullable|date',
            ],
            'foreign_keys' => [],
            'context' => function () {
                return "These are driver records for commercial vehicle drivers. " .
                       "License number identifies the person and usually stays the same when renewed. " .
                       "Card number identifies the physical document and changes with renewal. " .
                       "Country code should be in ISO 3166-1 alpha-2 format (e.g., 'FR' for France).";
            },
        ];
    }
} 