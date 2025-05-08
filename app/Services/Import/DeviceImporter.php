<?php

namespace App\Services\Import;

use App\Models\Device;
use App\Models\DeviceType;

class DeviceImporter implements ImporterInterface
{
    public function getModelClass(): string
    {
        return Device::class;
    }

    public function getRequiredPermission(): string
    {
        return 'create_devices';
    }

    public function getRequestArrayName(): string
    {
        return 'devices';
    }

    public function getInertiaPageName(): string
    {
        return 'devices/import';
    }

    public function getTargetFields(): array
    {
        return [
            'device_type_id' => 'Device Type (required)',
            'serial_number' => 'Serial Number (required)',
            'imei' => 'IMEI Number (required)',
            'sim_number' => 'SIM Number (optional)',
            'firmware_version' => 'Firmware Version (optional)',
        ];
    }

    public function getMandatoryFields(): array
    {
        return ['device_type_id', 'serial_number', 'imei'];
    }

    public function getUniqueField(): string
    {
        return 'imei';
    }

    public function getRowValidationRules(): array
    {
        return [
            'device_type_id' => 'required',
            'serial_number' => 'required|string|max:255',
            // IMEI unique check is handled by CsvImportService during full import, 
            // For single row validation, we might not want to hit DB for unique check frequently.
            // Or, if it's crucial, it can be 'required|string|max:255|unique:devices,imei'
            'imei' => 'required|string|max:255',
            'sim_number' => 'nullable|string|max:255',
            'firmware_version' => 'nullable|string|max:255',
        ];
    }
    
    public function getStoreRequestValidationRules(): array
    {
        $arrayName = $this->getRequestArrayName();
        return [
            $arrayName => 'required|array',
            "{$arrayName}.*.device_type_id" => 'required|exists:device_types,id',
            "{$arrayName}.*.serial_number" => 'required|string|max:255',
            "{$arrayName}.*.imei" => 'required|string|max:255|unique:devices,imei',
            "{$arrayName}.*.sim_number" => 'nullable|string|max:255',
            "{$arrayName}.*.firmware_version" => 'nullable|string|max:255',
            'tenant_id' => 'nullable|exists:tenants,id', // Common for all imports
        ];
    }

    public function getForeignKeyConfigs(): array
    {
        return [
            'device_type_id' => [
                'model' => DeviceType::class,
                'field' => 'name',
                'id_field' => 'id',
            ],
        ];
    }

    public function getAiMappingContext(): string
    {
        $deviceTypes = DeviceType::all()->pluck('name')->implode(', ');
        return "These are device records for telematics devices. The IMEI is a unique 15-digit identifier. " .
               "Serial Number is another identifier often printed on the device. " .
               "Available device types are: {$deviceTypes}";
    }

    public function preloadReferenceData(): array
    {
        $data = [];
        $foreignKeys = $this->getForeignKeyConfigs();
        if (!empty($foreignKeys['device_type_id'])) {
            $config = $foreignKeys['device_type_id'];
            $modelClass = $config['model'];
            $field = $config['field'];
            $idField = $config['id_field'];
            $data['device_type_id'] = $modelClass::all()->pluck($idField, $field)->mapWithKeys(function ($id, $name) {
                return [strtolower(trim($name)) => $id];
            })->toArray();
        }
        return $data;
    }

    public function mapForeignKeysForRow(array $row, array $referenceData): array
    {
        $warnings = [];
        $fieldName = 'device_type_id';
        if (!empty($row[$fieldName]) && is_string($row[$fieldName])) {
            $fieldValue = trim($row[$fieldName]);
            $fieldValueKey = strtolower($fieldValue);

            if (isset($referenceData[$fieldName][$fieldValueKey])) {
                $row[$fieldName] = $referenceData[$fieldName][$fieldValueKey];
            } else {
                $warnings[] = __("common.csv_import.unknown_value_for_field", ['value' => $fieldValue, 'field' => 'Device Type']);
                 // Keep original value or set to null, depending on desired behavior
                 // $row[$fieldName] = null; 
            }
        }
        return ['row' => $row, 'warnings' => $warnings];
    }

    public function getFormData(): array
    {
        return [
            'deviceTypes' => DeviceType::orderBy('name')->get(),
        ];
    }

    public function createEntity(array $data): object
    {
        return new Device($data);
    }

    public function getFallbackMappingKeywords(): array
    {
        return [
            'device_type_id' => ['device type', 'type', 'model name', 'category', 'devicetype'],
            'serial_number' => ['serial', 'serial no', 'sn', 'device id', 'hardware id'],
            'imei' => ['imei', 'imei number', 'international mobile equipment identity'],
            'sim_number' => ['sim', 'sim card', 'iccid', 'sim id'],
            'firmware_version' => ['firmware', 'fw version', 'software version', 'version'],
        ];
    }
    
    public function getFriendlyName(): string
    {
        return 'device';
    }
} 