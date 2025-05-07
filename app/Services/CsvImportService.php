<?php

namespace App\Services;

use App\Models\Device;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use OpenAI;

class CsvImportService
{
    /**
     * Import a CSV or Excel file and map columns intelligently.
     *
     * @param UploadedFile $file The uploaded file (CSV or Excel) to process
     * @param string $type The type of import to perform (e.g., 'device', 'vehicle', 'driver')
     * @return array Result of the import with mapping and parsed data
     */
    public function import(UploadedFile $file, string $type): array
    {
        $result = [
            'success' => false,
            'data' => null,
            'mapping' => null,
            'warnings' => [],
            'error' => null,
        ];

        try {
            // Store the uploaded file temporarily
            $filePath = $file->store('temp/csv-imports', 'public');
            $fullFilePath = Storage::disk('public')->path($filePath);

            if (!file_exists($fullFilePath) || !is_readable($fullFilePath)) {
                throw new \Exception(__("common.csv_import.error_reading_file"));
            }

            // Load the file and extract headers and a sample of rows
            $fileData = $this->loadFileData($fullFilePath);
            
            if (empty($fileData['headers']) || empty($fileData['sample'])) {
                throw new \Exception(__("common.csv_import.error_empty_file"));
            }

            // Call the appropriate mapping method based on the type
            switch ($type) {
                case 'device':
                    $mapping = $this->mapDeviceColumns($fileData);
                    break;
                case 'vehicle':
                    $mapping = $this->mapVehicleColumns($fileData);
                    break;
                case 'driver':
                    $mapping = $this->mapDriverColumns($fileData);
                    break;
                default:
                    throw new \Exception(__("common.csv_import.invalid_type"));
            }

            // Process all rows using the determined mapping
            $parsedData = $this->processFileWithMapping($fullFilePath, $mapping, $type);

            // Clean up temporary storage
            Storage::disk('public')->delete($filePath);

            $result = [
                'success' => true,
                'data' => $parsedData['rows'],
                'mapping' => $mapping,
                'warnings' => $parsedData['warnings'],
                'error' => null,
            ];

            return $result;
            
        } catch (\Exception $e) {
            Log::error('CSV/Excel import failed: ' . $e->getMessage());
            
            // Clean up temporary storage if it exists
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
            
            return [
                'success' => false,
                'data' => null,
                'mapping' => null,
                'warnings' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Load data from a CSV/Excel file.
     *
     * @param string $filePath Path to the file
     * @return array Array with headers and sample rows
     */
    private function loadFileData(string $filePath): array
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $sampleSize = 5; // Number of sample rows to extract
        
        try {
            $rows = Excel::toArray([], $filePath)[0] ?? [];
            
            if (empty($rows)) {
                return ['headers' => [], 'sample' => []];
            }
            
            $headers = array_shift($rows); // Get the first row as headers
            $sample = array_slice($rows, 0, $sampleSize); // Get a sample of data rows
            
            return [
                'headers' => $headers,
                'sample' => $sample,
                'totalRows' => count($rows)
            ];
        } catch (\Exception $e) {
            Log::error('Error reading file: ' . $e->getMessage());
            throw new \Exception(__("common.csv_import.error_reading_file"));
        }
    }

    /**
     * Process the file using the determined mapping.
     *
     * @param string $filePath Path to the file
     * @param array $mapping Column mapping
     * @param string $type Type of import ('device', 'vehicle', 'driver')
     * @return array Processed data and warnings
     */
    private function processFileWithMapping(string $filePath, array $mapping, string $type): array
    {
        $processedRows = [];
        $warnings = [];
        $uniqueValues = [];
        
        try {
            $rows = Excel::toArray([], $filePath)[0] ?? [];
            
            if (empty($rows)) {
                return ['rows' => [], 'warnings' => []];
            }
            
            $headers = array_shift($rows); // Get the first row as headers
            
            // Preload reference data for foreign key mapping
            $referenceData = $this->preloadReferenceData($type);
            
            // Process each row
            foreach ($rows as $rowIndex => $row) {
                // Skip empty rows
                if ($this->isEmptyRow($row)) {
                    continue;
                }
                
                $processedRow = [];
                
                // Apply the mapping to extract values
                foreach ($mapping as $targetField => $sourceField) {
                    if ($sourceField === null) {
                        $processedRow[$targetField] = null;
                        continue;
                    }
                    
                    $headerIndex = array_search($sourceField, $headers);
                    if ($headerIndex !== false && isset($row[$headerIndex])) {
                        $processedRow[$targetField] = $row[$headerIndex];
                    } else {
                        $processedRow[$targetField] = null;
                    }
                }
                
                // Convert text values to IDs for foreign keys
                $foreignKeyMappingResult = $this->mapForeignKeys($processedRow, $type, $referenceData);
                $processedRow = $foreignKeyMappingResult['row'];
                
                // Add foreign key mapping warnings if any
                if (!empty($foreignKeyMappingResult['warnings'])) {
                    foreach ($foreignKeyMappingResult['warnings'] as $warning) {
                        $warnings[] = [
                            'row' => $rowIndex + 2,
                            'message' => $warning,
                            'ignored' => false
                        ];
                    }
                }
                
                // Check for duplicates within the import file
                $uniqueField = $this->getUniqueField($type);
                if (!empty($processedRow[$uniqueField])) {
                    if (isset($uniqueValues[$uniqueField][$processedRow[$uniqueField]])) {
                        $warnings[] = [
                            'row' => $rowIndex + 2,
                            'message' => __("common.csv_import.duplicate_in_import", [
                                'row' => $rowIndex + 2, 
                                'field' => __("{$type}s.fields.{$uniqueField}")
                            ]),
                            'ignored' => true
                        ];
                        continue;
                    }
                    
                    $uniqueValues[$uniqueField][$processedRow[$uniqueField]] = true;
                }
                
                // Apply validations based on type
                $validationResult = $this->validateRow($processedRow, $type);
                
                if (!$validationResult['valid']) {
                    $warnings[] = [
                        'row' => $rowIndex + 2, // +2 because 1-indexed and headers are row 1
                        'message' => __("common.csv_import.validation_failed", ['row' => $rowIndex + 2]),
                        'errors' => $validationResult['errors'],
                        'ignored' => false
                    ];
                    // Add validation errors to the row
                    $processedRow['_validation'] = [
                        'valid' => false,
                        'errors' => $validationResult['errors']
                    ];
                } else {
                    // Mark as valid
                    $processedRow['_validation'] = [
                        'valid' => true,
                        'errors' => []
                    ];
                }
                
                // Add the processed row to our results regardless of validation
                $processedRows[] = $processedRow;
            }
            
            return [
                'rows' => $processedRows,
                'warnings' => $warnings
            ];
            
        } catch (\Exception $e) {
            Log::error('Error processing file: ' . $e->getMessage());
            throw new \Exception(__("common.csv_import.error_processing_file"));
        }
    }

    /**
     * Check if a row is empty (all cells are null, empty or contain only whitespace).
     *
     * @param array $row The row to check
     * @return bool True if the row is empty
     */
    private function isEmptyRow(array $row): bool
    {
        if (empty($row)) {
            return true;
        }
        
        foreach ($row as $cell) {
            // If any cell has a non-empty value, the row is not empty
            if ($cell !== null && $cell !== '' && trim($cell) !== '') {
                return false;
            }
        }
        
        // If we got here, all cells were empty/null/whitespace
        return true;
    }

    /**
     * Map the columns of a device import file using OpenAI.
     *
     * @param array $fileData File data including headers and sample rows
     * @return array Mapping from target fields to source columns
     */
    private function mapDeviceColumns(array $fileData): array
    {
        $targetFields = [
            'device_type_id' => 'Device Type (required)',
            'serial_number' => 'Serial Number (required)',
            'imei' => 'IMEI Number (required)',
            'sim_number' => 'SIM Number (optional)',
            'firmware_version' => 'Firmware Version (optional)',
        ];
        
        // Get device types from the database for context
        $deviceTypes = \App\Models\DeviceType::all()->pluck('name')->implode(', ');
        
        return $this->useAIToMapColumns($fileData, $targetFields, [
            'context' => "These are device records for telematics devices. The IMEI is a unique 15-digit identifier. " .
                        "Serial Number is another identifier often printed on the device. " . 
                        "Available device types are: $deviceTypes"
        ]);
    }

    /**
     * Map the columns of a vehicle import file using OpenAI.
     *
     * @param array $fileData File data including headers and sample rows
     * @return array Mapping from target fields to source columns
     */
    private function mapVehicleColumns(array $fileData): array
    {
        $targetFields = [
            'registration' => 'Registration Number/License Plate (required)',
            'vin' => 'VIN - Vehicle Identification Number (required)',
            'vehicle_model_id' => 'Vehicle Model (required)',
            'vehicle_type_id' => 'Vehicle Type (required)',
        ];
        
        // Get vehicle types and models for context
        $vehicleTypes = \App\Models\VehicleType::all()->pluck('name')->implode(', ');
        $vehicleBrands = \App\Models\VehicleBrand::with('models')->get();
        
        $modelsContext = '';
        foreach ($vehicleBrands as $brand) {
            $models = $brand->models->pluck('name')->implode(', ');
            $modelsContext .= "Brand: {$brand->name}, Models: $models; ";
        }
        
        return $this->useAIToMapColumns($fileData, $targetFields, [
            'context' => "These are vehicle records. The registration is the license plate. " .
                        "VIN is a 17-character vehicle identification number. " . 
                        "Available vehicle types are: $vehicleTypes. " .
                        "Available vehicle brands and models are: $modelsContext"
        ]);
    }

    /**
     * Map the columns of a driver import file using OpenAI.
     *
     * @param array $fileData File data including headers and sample rows
     * @return array Mapping from target fields to source columns
     */
    private function mapDriverColumns(array $fileData): array
    {
        $targetFields = [
            'firstname' => 'First Name (required)',
            'surname' => 'Last Name/Surname (required)',
            'license_number' => 'Driver License Number (required)',
            'card_number' => 'Driver Card Number (optional)',
            'birthdate' => 'Date of Birth (optional)',
            'phone' => 'Phone Number (optional)',
            'card_issuing_country' => 'Country Code (optional)',
            'card_issuing_date' => 'License Issue Date (optional)',
            'card_expiration_date' => 'License Expiry Date (optional)',
        ];
        
        return $this->useAIToMapColumns($fileData, $targetFields, [
            'context' => "These are driver records for commercial vehicle drivers. " .
                        "License number identifies the person and usually stays the same when renewed. " .
                        "Card number identifies the physical document and changes with renewal. " .
                        "Country code should be in ISO 3166-1 alpha-2 format (e.g., 'FR' for France)."
        ]);
    }

    /**
     * Use OpenAI to map file columns to target fields.
     *
     * @param array $fileData File data including headers and sample rows
     * @param array $targetFields Target fields with descriptions
     * @param array $options Additional options like context information
     * @return array Mapping from target fields to source columns
     */
    private function useAIToMapColumns(array $fileData, array $targetFields, array $options = []): array
    {
        try {
            $client = OpenAI::client(config('openai.api_key'));
            
            // Prepare data to send to OpenAI
            $headers = $fileData['headers'];
            $sample = $fileData['sample'];
            
            // Format sample data for better readability
            $sampleRows = [];
            foreach ($sample as $row) {
                $formattedRow = [];
                foreach ($headers as $index => $header) {
                    $value = $row[$index] ?? '';
                    $formattedRow[$header] = $value;
                }
                $sampleRows[] = $formattedRow;
            }
            
            // Create the prompt for OpenAI
            $targetFieldsFormatted = [];
            foreach ($targetFields as $field => $description) {
                $targetFieldsFormatted[] = "- $field: $description";
            }
            
            $context = $options['context'] ?? '';
            
            $response = $client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert data analyst specializing in CSV/Excel file column mapping. ' .
                                    'Your task is to analyze file headers and sample data to determine the best mapping to target fields. ' .
                                    'You will return a JSON object mapping target field names to source column names in the file. ' .
                                    'If no appropriate match is found for a field, use null as the value.'
                    ],
                    [
                        'role' => 'user',
                        'content' => "I'm importing a file with the following headers:\n\n" . 
                                    implode(", ", $headers) . "\n\n" .
                                    "Here's a sample of the data (5 rows):\n\n" .
                                    json_encode($sampleRows, JSON_PRETTY_PRINT) . "\n\n" .
                                    "I need to map these columns to the following target fields:\n\n" .
                                    implode("\n", $targetFieldsFormatted) . "\n\n" .
                                    ($context ? "Additional context: $context\n\n" : "") .
                                    "Please return a JSON object mapping each target field to the most appropriate column name from the file. " .
                                    "Use null if there's no appropriate match. ONLY return the JSON object, no explanation."
                    ]
                ]
            ]);

            // Extract and parse the JSON response
            $content = $response->choices[0]->message->content;
            
            // Try to extract JSON from the response
            if (preg_match('/```json(.*?)```/s', $content, $matches)) {
                $jsonString = $matches[1];
            } else {
                $jsonString = $content;
            }
            
            // Clean and decode the JSON
            $jsonString = preg_replace('/```(json)?|```/', '', $jsonString);
            $mapping = json_decode($jsonString, true);
            
            if (!$mapping || json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Failed to parse AI response: " . json_last_error_msg());
            }
            
            return $mapping;
            
        } catch (\Exception $e) {
            Log::error('Column mapping with AI failed: ' . $e->getMessage());
            
            // If AI mapping fails, provide a manual "best guess" mapping
            $mapping = [];
            foreach ($targetFields as $targetField => $description) {
                // Try to find a column with a similar name
                $mapping[$targetField] = $this->findBestColumnMatch($targetField, $fileData['headers']);
            }
            
            return $mapping;
        }
    }

    /**
     * Find the best matching column for a given field using simple text matching.
     * This is a fallback if AI mapping fails.
     *
     * @param string $targetField The target field name
     * @param array $headers Available headers in the file
     * @return string|null Best matching header or null if no match
     */
    private function findBestColumnMatch(string $targetField, array $headers): ?string
    {
        // Convert targetField to lowercase for comparison
        $targetField = strtolower($targetField);
        
        // Keywords for common field name variations
        $fieldKeywords = [
            'device_type_id' => ['device', 'type', 'model', 'category'],
            'serial_number' => ['serial', 'sn', 'nummer', 'number', 'série'],
            'imei' => ['imei', 'international mobile equipment identity'],
            'sim_number' => ['sim', 'subscriber', 'iccid'],
            'firmware_version' => ['firmware', 'version', 'fw', 'soft'],
            'registration' => ['registration', 'license', 'plate', 'immatriculation'],
            'vin' => ['vin', 'vehicle identification', 'chassis'],
            'vehicle_model_id' => ['model', 'make model'],
            'vehicle_type_id' => ['type', 'category', 'class'],
            'firstname' => ['firstname', 'first', 'given', 'prénom', 'forename'],
            'surname' => ['surname', 'lastname', 'last', 'family', 'nom'],
            'license_number' => ['license', 'driver license', 'permit', 'permis'],
            'card_number' => ['card', 'document', 'id'],
            'birthdate' => ['birth', 'dob', 'naissance', 'born'],
            'phone' => ['phone', 'telephone', 'tel', 'mobile', 'cell'],
            'card_issuing_country' => ['country', 'nation', 'pays', 'issued by'],
            'card_issuing_date' => ['issue', 'issued', 'start', 'beginning', 'emission'],
            'card_expiration_date' => ['expiry', 'expiration', 'expires', 'end', 'valid until'],
        ];
        
        // If we have keywords for this field
        if (isset($fieldKeywords[$targetField])) {
            $keywords = $fieldKeywords[$targetField];
            
            foreach ($headers as $header) {
                $headerLower = strtolower($header);
                
                // Direct match with field name
                if (strpos($headerLower, $targetField) !== false) {
                    return $header;
                }
                
                // Check against keywords
                foreach ($keywords as $keyword) {
                    if (strpos($headerLower, $keyword) !== false) {
                        return $header;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Validate a row based on the import type.
     *
     * @param array $row Row data
     * @param string $type Import type
     * @return array Validation result with 'valid' flag and 'errors'
     */
    private function validateRow(array $row, string $type): array
    {
        $rules = [];

        switch ($type) {
            case 'device':
                $rules = [
                    'device_type_id' => 'required',
                    'serial_number' => 'required|string|max:255',
                    'imei' => 'required|string|max:255|unique:devices,imei',
                    'sim_number' => 'nullable|string|max:255',
                    'firmware_version' => 'nullable|string|max:255',
                ];
                break;
                
            case 'vehicle':
                $rules = [
                    'registration' => 'nullable|string|max:255|unique:vehicles,registration',
                    'vin' => 'required|string|max:255',
                    'vehicle_model_id' => 'required',
                    'vehicle_type_id' => 'required',
                ];
                break;
                
            case 'driver':
                $rules = [
                    'firstname' => 'required|string|max:255',
                    'surname' => 'required|string|max:255',
                    'license_number' => 'required|string|max:255|unique:drivers,license_number',
                    'card_number' => 'nullable|string|max:255',
                    'birthdate' => 'nullable|date',
                    'phone' => 'nullable|string|max:255',
                    'card_issuing_country' => 'nullable|string|max:2',
                    'card_issuing_date' => 'nullable|date',
                    'card_expiration_date' => 'nullable|date',
                ];
                break;
        }
        
        $validator = Validator::make($row, $rules);
        
        return [
            'valid' => !$validator->fails(),
            'errors' => $validator->errors()->all()
        ];
    }

    /**
     * Preload reference data for foreign key mapping.
     *
     * @param string $type Type of import ('device', 'vehicle', 'driver')
     * @return array Reference data for lookups
     */
    private function preloadReferenceData(string $type): array
    {
        $data = [];
        
        switch ($type) {
            case 'device':
                // Load device types
                $data['device_types'] = \App\Models\DeviceType::all()->mapWithKeys(function ($item) {
                    return [strtolower($item->name) => $item->id];
                })->toArray();
                break;
                
            case 'vehicle':
                // Load vehicle types
                $data['vehicle_types'] = \App\Models\VehicleType::all()->mapWithKeys(function ($item) {
                    return [strtolower($item->name) => $item->id];
                })->toArray();
                
                // Load vehicle models with their brands for more context
                $data['vehicle_models'] = [];
                $data['vehicle_brands'] = [];
                
                $vehicleBrands = \App\Models\VehicleBrand::with('models')->get();
                foreach ($vehicleBrands as $brand) {
                    $data['vehicle_brands'][strtolower($brand->name)] = $brand->id;
                    
                    foreach ($brand->models as $model) {
                        // Store with both standalone model name and brand+model format
                        $data['vehicle_models'][strtolower($model->name)] = $model->id;
                        $data['vehicle_models'][strtolower($brand->name . ' ' . $model->name)] = $model->id;
                    }
                }
                break;
                
            case 'driver':
                // For drivers, load country codes mapping if needed
                $data['countries'] = [
                    'fr' => 'FR', 'france' => 'FR',
                    'uk' => 'GB', 'united kingdom' => 'GB', 'great britain' => 'GB', 'england' => 'GB',
                    'de' => 'DE', 'germany' => 'DE',
                    'es' => 'ES', 'spain' => 'ES',
                    'it' => 'IT', 'italy' => 'IT',
                    'us' => 'US', 'usa' => 'US', 'united states' => 'US',
                    'ca' => 'CA', 'canada' => 'CA',
                    'be' => 'BE', 'belgium' => 'BE',
                    'nl' => 'NL', 'netherlands' => 'NL',
                    'ch' => 'CH', 'switzerland' => 'CH',
                    'pt' => 'PT', 'portugal' => 'PT',
                    // Add more countries as needed
                ];
                break;
        }
        
        return $data;
    }

    /**
     * Map foreign key text values to their respective IDs.
     *
     * @param array $row The processed row with text values
     * @param string $type Import type
     * @param array $referenceData Preloaded reference data for lookups
     * @return array Result with updated row and any warnings
     */
    private function mapForeignKeys(array $row, string $type, array $referenceData): array
    {
        $warnings = [];
        
        switch ($type) {
            case 'device':
                // Map device_type_id
                if (!empty($row['device_type_id'])) {
                    $deviceTypeName = trim($row['device_type_id']);
                    $deviceTypeKey = strtolower($deviceTypeName);
                    
                    if (isset($referenceData['device_types'][$deviceTypeKey])) {
                        $row['device_type_id'] = $referenceData['device_types'][$deviceTypeKey];
                    } else {
                        // Not found, add a warning
                        $warnings[] = __("common.csv_import.unknown_device_type", ['value' => $deviceTypeName]);
                        // Keep the original value for now, validation will catch it
                    }
                }
                break;
                
            case 'vehicle':
                // Map vehicle_type_id
                if (!empty($row['vehicle_type_id'])) {
                    $vehicleTypeName = trim($row['vehicle_type_id']);
                    $vehicleTypeKey = strtolower($vehicleTypeName);
                    
                    if (isset($referenceData['vehicle_types'][$vehicleTypeKey])) {
                        $row['vehicle_type_id'] = $referenceData['vehicle_types'][$vehicleTypeKey];
                    } else {
                        $warnings[] = __("common.csv_import.unknown_vehicle_type", ['value' => $vehicleTypeName]);
                    }
                }
                
                // Map vehicle_model_id
                if (!empty($row['vehicle_model_id'])) {
                    $modelName = trim($row['vehicle_model_id']);
                    $modelKey = strtolower($modelName);
                    
                    // Check direct model match
                    if (isset($referenceData['vehicle_models'][$modelKey])) {
                        $row['vehicle_model_id'] = $referenceData['vehicle_models'][$modelKey];
                    } else {
                        // Try to parse as "Brand Model" format
                        $parts = explode(' ', $modelName, 2);
                        if (count($parts) == 2) {
                            $brandKey = strtolower($parts[0]);
                            $combinedKey = strtolower($modelName);
                            
                            // Try the combined key first
                            if (isset($referenceData['vehicle_models'][$combinedKey])) {
                                $row['vehicle_model_id'] = $referenceData['vehicle_models'][$combinedKey];
                            } 
                            // If we have a brand, we could potentially add a new model in the future
                            else if (isset($referenceData['vehicle_brands'][$brandKey])) {
                                $warnings[] = __("common.csv_import.unknown_vehicle_model", [
                                    'value' => $modelName,
                                    'brand' => $parts[0]
                                ]);
                            } else {
                                $warnings[] = __("common.csv_import.unknown_vehicle_model_brand", ['value' => $modelName]);
                            }
                        } else {
                            $warnings[] = __("common.csv_import.unknown_vehicle_model", ['value' => $modelName, 'brand' => 'N/A']);
                        }
                    }
                }
                break;
                
            case 'driver':
                // Map country code to standard format if provided
                if (!empty($row['card_issuing_country'])) {
                    $countryInput = trim(strtolower($row['card_issuing_country']));
                    
                    // If it's already a valid 2-letter code (assuming uppercase)
                    if (strlen($countryInput) === 2) {
                        $row['card_issuing_country'] = strtoupper($countryInput);
                    }
                    // Otherwise try to map from country name to code
                    else if (isset($referenceData['countries'][$countryInput])) {
                        $row['card_issuing_country'] = $referenceData['countries'][$countryInput];
                    } else {
                        $warnings[] = __("common.csv_import.unknown_country_code", ['value' => $row['card_issuing_country']]);
                    }
                }
                
                // Format dates if they're not already in YYYY-MM-DD format
                foreach (['birthdate', 'card_issuing_date', 'card_expiration_date'] as $dateField) {
                    if (!empty($row[$dateField]) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $row[$dateField])) {
                        try {
                            // Parse the date and convert to Y-m-d format
                            $date = new \DateTime($row[$dateField]);
                            $row[$dateField] = $date->format('Y-m-d');
                        } catch (\Exception $e) {
                            $warnings[] = __("common.csv_import.invalid_date_format", [
                                'field' => $dateField,
                                'value' => $row[$dateField]
                            ]);
                        }
                    }
                }
                break;
        }
        
        return [
            'row' => $row,
            'warnings' => $warnings
        ];
    }

    /**
     * Get the unique field name based on import type.
     *
     * @param string $type Import type
     * @return string Field used for uniqueness check
     */
    private function getUniqueField(string $type): string
    {
        switch ($type) {
            case 'device':
                return 'imei';
            case 'vehicle':
                return 'registration';
            case 'driver':
                return 'license_number';
            default:
                return '';
        }
    }
} 