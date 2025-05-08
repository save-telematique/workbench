<?php

namespace Database\Seeders;

use App\Enum\DataPointDataType;
use App\Enum\MessageFields;
use App\Models\DataPointType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DataPointTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $formatName = function (string $caseName): string {
            return Str::of($caseName)->replace('_', ' ')->title()->toString();
        };

        foreach (MessageFields::cases() as $field) {
            $caseName = $field->name; // ex: GPS_DATA
            $id = $field->value; // Use int value directly
            $name = $formatName($caseName);
            
            // Determine DataPointDataType based on field name and context
            $dataType = $this->determineDataType($field);
            $unit = $this->determineUnit($field);
            
            DataPointType::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $name,
                    'type' => $dataType, 
                    'category' => 'ATOMIC',
                    'processing_steps' => null,
                    'description' => $this->generateDescription($field),
                    'unit' => $unit,
                ]
            );
        }

        // Add any composite data points
        $this->createCompositeDataPoints();
    }
    
    /**
     * Determine the appropriate data type for a message field
     */
    private function determineDataType(MessageFields $field): DataPointDataType
    {
        // Temperature fields
        if (str_contains($field->name, 'TEMPERATURE')) {
            return DataPointDataType::FLOAT;
        }
        
        // Boolean indicators
        if (in_array($field->name, [
            'IGNITION', 'MOVEMENT', 'SLEEP_MODE', 'TRIP', 'IMMOBILIZER', 'AUTHORIZED_DRIVING',
            'TOWING', 'JAMMING', 'CRASH_DETECTION', 'DIGITAL_INPUT_1', 'DIGITAL_INPUT_2',
            'DIGITAL_INPUT_3', 'DIGITAL_INPUT_4', 'DIGITAL_OUTPUT_1', 'DIGITAL_OUTPUT_2',
            'DIGITAL_OUTPUT_3', 'DIGITAL_OUTPUT_4', 'BRAKE_SWITCH', 'CLUTCH_SWITCH',
            'CRUISE_CONTROL_ACTIVE', 'PTO_STATE', 'DOOR_STATUS', 'SD_STATUS', 'ZERO_SPEED',
            'IDLING'
        ])) {
            return DataPointDataType::BOOLEAN;
        }
        
        // Integer values
        if (in_array($field->name, [
            'TOTAL_ODOMETER', 'TRIP_ODOMETER', 'TOTAL_MILEAGE', 'TOTAL_MILEAGE_COUNTED',
            'ENGINE_WORKTIME', 'ENGINE_WORKTIME_COUNTED', 'GSM_CELL_ID', 'GSM_AREA_CODE',
            'ENGINE_RPM', 'ENGINE_SPEED', 'HARVESTING_DRUM_RPM', 'NUMBER_OF_RECORDS'
        ]) || str_contains($field->name, '_TIME') || str_contains($field->name, '_ID')) {
            return DataPointDataType::INTEGER;
        }
        
        // Float/decimal values
        if (in_array($field->name, [
            'FUEL_LEVEL_PERCENT', 'FUEL_LEVEL_LITERS', 'FUEL_LEVEL', 'ADBLUE_LEVEL_PERCENT',
            'ADBLUE_LEVEL_LITERS', 'EXTERNAL_VOLTAGE', 'BATTERY_VOLTAGE', 'BATTERY_CURRENT',
            'BATTERY_LEVEL_PERCENT', 'SPEED', 'VEHICLE_SPEED', 'VEHICLE_SPEED_2', 'AXIS_X',
            'AXIS_Y', 'AXIS_Z', 'GNSS_PDOP', 'GNSS_HDOP', 'ACCELERATOR_PEDAL_POSITION', 
            'ACCELERATION_PEDAL_POSITION', 'ENGINE_LOAD', 'ENGINE_CURRENT_LOAD'
        ]) || 
        str_contains($field->name, 'FUEL_USED') || 
        str_contains($field->name, 'FUEL_CONSUMED') ||
        str_contains($field->name, 'FUEL_RATE') ||
        str_contains($field->name, '_LEVEL_') ||
        str_contains($field->name, 'WEIGHT') ||
        str_contains($field->name, 'LOAD')) {
            return DataPointDataType::FLOAT;
        }
        
        // JSON data
        if (in_array($field->name, [
            'GPS_DATA', 'DEVICE_DATA', 'CRASH_TRACE_DATA', 'DTC_ERRORS'
        ])) {
            return DataPointDataType::JSON;
        }
        
        // IDs and extended data
        if (in_array($field->name, [
            'VIN', 'VRN', 'DRIVER_ID_1', 'DRIVER_ID_2', 'IMSI', 'CCID_PART1', 'CCID_PART2',
            'CCID_PART3', 'VEHICLE_REGISTRATION_NUMBER_PART1', 'VEHICLE_REGISTRATION_NUMBER_PART2',
            'VEHICLE_IDENTIFICATION_NUMBER_PART1', 'VEHICLE_IDENTIFICATION_NUMBER_PART2',
            'VEHICLE_IDENTIFICATION_NUMBER_PART3', 'DRIVER_1_ID_MSB', 'DRIVER_1_ID_LSB',
            'DRIVER_2_ID_MSB', 'DRIVER_2_ID_LSB', 'DRIVER_1_NAME', 'DRIVER_1_SURNAME',
            'DRIVER_2_NAME', 'DRIVER_2_SURNAME', 'RFID', 'RFID_COM2', 'IBUTTON'
        ])) {
            return DataPointDataType::STRING;
        }
        
        // Default to STRING for anything else
        return DataPointDataType::STRING;
    }
    
    /**
     * Generate a description for a message field
     */
    private function generateDescription(MessageFields $field): ?string
    {
        $description = null;
        
        // Add specific descriptions for important fields
        switch ($field) {
            case MessageFields::GPS_DATA:
                $description = 'JSON structure containing GPS location data';
                break;
            case MessageFields::DEVICE_DATA:
                $description = 'JSON structure containing device metadata';
                break;
            case MessageFields::VIN:
                $description = 'Vehicle Identification Number';
                break;
            case MessageFields::VRN:
                $description = 'Vehicle Registration Number';
                break;
            case MessageFields::TOTAL_ODOMETER:
                $description = 'Total distance traveled by the vehicle in meters';
                break;
            case MessageFields::IGNITION:
                $description = 'Indicates if the vehicle ignition is on (true) or off (false)';
                break;
        }
        
        return $description;
    }
    
    /**
     * Determine measurement unit for a field if applicable
     */
    private function determineUnit(MessageFields $field): ?string
    {
        // Temperature units
        if (str_contains($field->name, 'TEMPERATURE')) {
            return '°C';
        }
        
        // Distance units
        if (str_contains($field->name, 'ODOMETER') || str_contains($field->name, 'MILEAGE') || 
            str_contains($field->name, 'DISTANCE')) {
            return 'm';
        }
        
        // Percentage units
        if (str_contains($field->name, 'PERCENT')) {
            return '%';
        }
        
        // Speed units
        if (str_contains($field->name, 'SPEED')) {
            return 'km/h';
        }
        
        // Voltage units
        if (str_contains($field->name, 'VOLTAGE')) {
            return 'V';
        }
        
        // Current units
        if (str_contains($field->name, 'CURRENT')) {
            return 'A';
        }
        
        // Time units
        if (str_contains($field->name, 'TIME') && !str_contains($field->name, 'TIMESTAMP')) {
            return 's';
        }
        
        // RPM units
        if (str_contains($field->name, 'RPM')) {
            return 'rpm';
        }
        
        // Fuel units
        if (str_contains($field->name, 'FUEL_LEVEL_LITERS') || str_contains($field->name, 'FUEL_CONSUMED')) {
            return 'L';
        }
        
        // Weight units
        if (str_contains($field->name, 'WEIGHT') || str_contains($field->name, 'LOAD')) {
            return 'kg';
        }
        
        return null;
    }
    
    /**
     * Create composite data points that derive from atomic data points
     */
    private function createCompositeDataPoints(): void
    {
        DataPointType::updateOrCreate(
            ['id' => 1000001],
            [
                'name' => 'Odomètre Kilomètres',
                'type' => DataPointDataType::FLOAT,
                'unit' => 'km',
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    [
                        'logic' => 'GET_LATEST_FROM_SOURCE',
                        'source_data_point_type_id' => MessageFields::TOTAL_ODOMETER->value,
                    ],
                    [
                        'logic' => 'MULTIPLY_BY',
                        'multiplier' => 0.001,
                    ],
                ],
                'description' => 'Alias pour l\'odomètre total. Source en mètres, affiché en km.',
            ]
        );
        
        DataPointType::updateOrCreate(
            ['id' => 1000002],
            [
                'name' => 'État du Contact (Booléen)',
                'type' => DataPointDataType::BOOLEAN,
                'unit' => null,
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    [
                        'logic' => 'GET_LATEST_FROM_SOURCE',
                        'source_data_point_type_id' => MessageFields::IGNITION->value,
                    ]
                ],
                'description' => 'Alias pour l\'état du contact, déjà en booléen.',
            ]
        );
        
        DataPointType::updateOrCreate(
            ['id' => 1000003],
            [
                'name' => 'Niveau de Carburant (%)',
                'type' => DataPointDataType::FLOAT,
                'unit' => '%',
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    [
                        'logic' => 'GET_LATEST_FROM_SOURCE',
                        'source_data_point_type_id' => MessageFields::FUEL_LEVEL_PERCENT->value,
                    ]
                ],
                'description' => 'Alias pour le niveau de carburant en pourcentage.',
            ]
        );
    }
}
