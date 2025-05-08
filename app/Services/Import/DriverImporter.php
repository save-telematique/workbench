<?php

namespace App\Services\Import;

use App\Models\Driver;
use DateTime;
use Exception;

class DriverImporter implements ImporterInterface
{
    public function getModelClass(): string
    {
        return Driver::class;
    }

    public function getRequiredPermission(): string
    {
        return 'create_drivers';
    }

    public function getRequestArrayName(): string
    {
        return 'drivers';
    }

    public function getInertiaPageName(): string
    {
        return 'drivers/import';
    }

    public function getTargetFields(): array
    {
        return [
            'firstname' => 'First Name (required)',
            'surname' => 'Last Name/Surname (required)',
            'license_number' => 'Driver License Number (required)',
            'card_number' => 'Driver Card Number (optional)',
            'birthdate' => 'Date of Birth (YYYY-MM-DD) (optional)',
            'phone' => 'Phone Number (optional)',
            'card_issuing_country' => 'License Issuing Country Code (2 letters, e.g., FR, GB) (optional)',
            'card_issuing_date' => 'License Issue Date (YYYY-MM-DD) (optional)',
            'card_expiration_date' => 'License Expiry Date (YYYY-MM-DD) (optional)',
        ];
    }

    public function getMandatoryFields(): array
    {
        return ['firstname', 'surname', 'license_number'];
    }

    public function getUniqueField(): string
    {
        return 'license_number';
    }

    public function getRowValidationRules(): array
    {
        return [
            'firstname' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'license_number' => 'required|string|max:255',
            'card_number' => 'nullable|string|max:255',
            'birthdate' => 'nullable|date_format:Y-m-d',
            'phone' => 'nullable|string|max:255',
            'card_issuing_country' => 'nullable|string|size:2', // Expecting 2-letter code after mapping
            'card_issuing_date' => 'nullable|date_format:Y-m-d',
            'card_expiration_date' => 'nullable|date_format:Y-m-d|after_or_equal:card_issuing_date',
        ];
    }

    public function getStoreRequestValidationRules(): array
    {
        $arrayName = $this->getRequestArrayName();
        $tenantId = request()->input('tenant_id') ?? tenant('id');
        return [
            $arrayName => 'required|array',
            "{$arrayName}.*.firstname" => 'required|string|max:255',
            "{$arrayName}.*.surname" => 'required|string|max:255',
            "{$arrayName}.*.license_number" => "required|string|max:255|unique:drivers,license_number,NULL,id,tenant_id,{$tenantId}",
            "{$arrayName}.*.card_number" => 'nullable|string|max:255',
            "{$arrayName}.*.birthdate" => 'nullable|date_format:Y-m-d',
            "{$arrayName}.*.phone" => 'nullable|string|max:255',
            "{$arrayName}.*.card_issuing_country" => 'nullable|string|size:2',
            "{$arrayName}.*.card_issuing_date" => 'nullable|date_format:Y-m-d',
            "{$arrayName}.*.card_expiration_date" => 'nullable|date_format:Y-m-d|after_or_equal:{$arrayName}.*.card_issuing_date',
            'tenant_id' => 'nullable|exists:tenants,id',
        ];
    }

    public function getForeignKeyConfigs(): array
    {
        return []; // No direct foreign key models to look up by name like DeviceType or VehicleModel
    }

    public function getAiMappingContext(): string
    {
        return "These are driver records for commercial vehicle drivers. " .
               "License number identifies the person. Card number identifies the physical document. " .
               "Country code should be in ISO 3166-1 alpha-2 format (e.g., FR for France). Dates YYYY-MM-DD.";
    }

    public function preloadReferenceData(): array
    {
        // For drivers, load country codes mapping
        return [
            'countries' => [
                'fr' => 'FR', 'france' => 'FR',
                'gb' => 'GB', 'uk' => 'GB', 'united kingdom' => 'GB', 'great britain' => 'GB', 'england' => 'GB',
                'de' => 'DE', 'germany' => 'DE',
                'es' => 'ES', 'spain' => 'ES',
                'it' => 'IT', 'italy' => 'IT',
                'us' => 'US', 'usa' => 'US', 'united states' => 'US',
                'ca' => 'CA', 'canada' => 'CA',
                'be' => 'BE', 'belgium' => 'BE',
                'nl' => 'NL', 'netherlands' => 'NL',
                'ch' => 'CH', 'switzerland' => 'CH',
                'pt' => 'PT', 'portugal' => 'PT',
                // Add more common country name variations to 2-letter ISO codes
            ],
        ];
    }

    public function mapForeignKeysForRow(array $row, array $referenceData): array
    {
        $warnings = [];

        // Handle country code mapping
        if (!empty($row['card_issuing_country'])) {
            $countryInput = trim(strtolower($row['card_issuing_country']));
            if (strlen($countryInput) === 2 && isset($referenceData['countries'][$countryInput])) { // e.g. they typed 'fr', map to 'FR'
                 $row['card_issuing_country'] = strtoupper($countryInput); // Ensure uppercase for valid 2-letter codes
            } elseif (isset($referenceData['countries'][$countryInput])) {
                $row['card_issuing_country'] = $referenceData['countries'][$countryInput];
            } elseif (strlen($countryInput) === 2 && ctype_alpha($countryInput)) { // Already a 2-letter code not in our map, assume it's valid
                 $row['card_issuing_country'] = strtoupper($countryInput);
            } else {
                $warnings[] = __("common.csv_import.unknown_country_code", ['value' => $row['card_issuing_country']]);
                // $row['card_issuing_country'] = null; // Or keep original based on desired behavior
            }
        }

        // Format dates (example: YYYY-MM-DD)
        foreach (['birthdate', 'card_issuing_date', 'card_expiration_date'] as $dateField) {
            if (!empty($row[$dateField])) {
                try {
                    // Check if it's already in Y-m-d, if so, skip DateTime parsing
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $row[$dateField])) {
                        // Potentially validate if it's a real date, e.g. DateTime::createFromFormat('Y-m-d', $value) !== false
                        // For now, assume valid if format matches
                    } else {
                        $date = new DateTime($row[$dateField]);
                        $row[$dateField] = $date->format('Y-m-d');
                    }
                } catch (Exception $e) {
                    $warnings[] = __("common.csv_import.invalid_date_format", [
                        'field' => $dateField,
                        'value' => $row[$dateField]
                    ]);
                    // $row[$dateField] = null; // Or keep original
                }
            }
        }
        return ['row' => $row, 'warnings' => $warnings];
    }

    public function getFormData(): array
    {
        return []; // No specific additional data needed for driver import form beyond tenants
    }

    public function createEntity(array $data): object
    {
        return new Driver($data);
    }

    public function getFallbackMappingKeywords(): array
    {
        return [
            'firstname' => ['first name', 'given name', 'forename', 'prénom'],
            'surname' => ['last name', 'family name', 'nom'],
            'license_number' => ['driver license', 'license no', 'permit number', 'numéro de permis'],
            'card_number' => ['driver card', 'tachograph card', 'carte conducteur'],
            'birthdate' => ['date of birth', 'dob', 'born on', 'date de naissance'],
            'phone' => ['phone number', 'mobile', 'contact number', 'téléphone'],
            'card_issuing_country' => ['issuing country', 'country code', 'license country', 'pays d\'émission'],
            'card_issuing_date' => ['issue date', 'license start date', 'date d\'émission'],
            'card_expiration_date' => ['expiry date', 'valid until', 'license end date', 'date d\'expiration'],
        ];
    }

    public function getFriendlyName(): string
    {
        return 'driver';
    }
} 