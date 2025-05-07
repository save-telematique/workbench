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
            // Get configuration for this import type
            $config = ImportTypeConfig::getConfig($type);
            
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

            // Map columns using AI and the configuration
            $mapping = $this->mapColumns($fileData, $type, $config);

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
     * Map columns using the configuration for the import type.
     *
     * @param array $fileData File data including headers and sample rows
     * @param string $type Import type
     * @param array $config Import type configuration
     * @return array Mapping from target fields to source columns
     */
    private function mapColumns(array $fileData, string $type, array $config): array
    {
        return $this->useAIToMapColumns(
            $fileData, 
            $config['target_fields'], 
            ['context' => is_callable($config['context']) ? $config['context']() : $config['context']]
        );
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
        $config = ImportTypeConfig::getConfig($type);
        
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
                $uniqueField = $config['unique_field'];
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
        $config = ImportTypeConfig::getConfig($type);
        $rules = $config['validation_rules'] ?? [];
        
        $validator = Validator::make($row, $rules);
        
        return [
            'valid' => !$validator->fails(),
            'errors' => $validator->errors()->all()
        ];
    }

    /**
     * Validate a single row for frontend live validation
     *
     * @param array $rowData Row data to validate
     * @param string $type Import type
     * @return array Validation result with valid flag, errors and warnings
     */
    public function validateSingleRow(array $rowData, string $type): array
    {
        $result = [
            'valid' => true,
            'errors' => [],
            'warnings' => [],
            'field_errors' => []
        ];
        
        try {
            $config = ImportTypeConfig::getConfig($type);
            
            // Preload reference data for foreign key resolution
            $referenceData = $this->preloadReferenceData($type);
            
            // Check for foreign key mapping errors
            $foreignKeyMappingResult = $this->mapForeignKeys($rowData, $type, $referenceData);
            $rowData = $foreignKeyMappingResult['row'];
            
            if (!empty($foreignKeyMappingResult['warnings'])) {
                $result['warnings'] = $foreignKeyMappingResult['warnings'];
            }
            
            // Perform validation
            $validationResult = $this->validateRow($rowData, $type);
            
            $result['valid'] = $validationResult['valid'];
            
            if (!$validationResult['valid']) {
                $result['errors'] = $validationResult['errors'];
                
                // Map errors to fields for more granular feedback
                $validator = Validator::make($rowData, $config['validation_rules'] ?? []);
                if ($validator->fails()) {
                    foreach ($validator->errors()->messages() as $field => $messages) {
                        $result['field_errors'][$field] = $messages;
                    }
                }
            }
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error('Row validation failed: ' . $e->getMessage());
            return [
                'valid' => false,
                'errors' => [$e->getMessage()],
                'warnings' => [],
                'field_errors' => []
            ];
        }
    }

    /**
     * Preload reference data for foreign key mapping.
     *
     * @param string $type Type of import ('device', 'vehicle', 'driver')
     * @return array Reference data for lookups
     */
    private function preloadReferenceData(string $type): array
    {
        $config = ImportTypeConfig::getConfig($type);
        $data = [];
        
        // Load reference data for foreign keys
        if (!empty($config['foreign_keys'])) {
            foreach ($config['foreign_keys'] as $fieldName => $foreignKeyConfig) {
                $modelClass = $foreignKeyConfig['model'];
                $field = $foreignKeyConfig['field'];
                $idField = $foreignKeyConfig['id_field'];
                
                // Load the model data for lookups
                $models = $modelClass::all();
                
                // Create a lookup table mapping the field value (lowercase) to the ID
                $data[$fieldName] = $models->mapWithKeys(function ($item) use ($field, $idField) {
                    return [strtolower($item->$field) => $item->$idField];
                })->toArray();
                
                // Handle special case for vehicle models with brands
                if (isset($foreignKeyConfig['relation']) && $foreignKeyConfig['relation'] === 'brand') {
                    $data["{$fieldName}_with_brand"] = [];
                    
                    // Load models with their brands
                    $modelsWithBrands = $modelClass::with($foreignKeyConfig['relation'])->get();
                    
                    foreach ($modelsWithBrands as $model) {
                        if ($model->{$foreignKeyConfig['relation']}) {
                            $brandName = $model->{$foreignKeyConfig['relation']}->{$foreignKeyConfig['combined_field']};
                            $combinedKey = strtolower($brandName . ' ' . $model->$field);
                            $data["{$fieldName}_with_brand"][$combinedKey] = $model->$idField;
                        }
                    }
                }
            }
        }
        
        // Special case for drivers (country codes)
        if ($type === 'driver') {
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
        $config = ImportTypeConfig::getConfig($type);
        
        if (empty($config['foreign_keys'])) {
            return ['row' => $row, 'warnings' => []];
        }
        
        foreach ($config['foreign_keys'] as $fieldName => $foreignKeyConfig) {
            if (!empty($row[$fieldName])) {
                $fieldValue = trim($row[$fieldName]);
                $fieldValueKey = strtolower($fieldValue);
                
                // Check if this value exists in the reference data
                if (isset($referenceData[$fieldName][$fieldValueKey])) {
                    $row[$fieldName] = $referenceData[$fieldName][$fieldValueKey];
                }
                // Check if it's a combined value (e.g. "Brand Model")
                elseif (isset($referenceData["{$fieldName}_with_brand"]) && isset($referenceData["{$fieldName}_with_brand"][$fieldValueKey])) {
                    $row[$fieldName] = $referenceData["{$fieldName}_with_brand"][$fieldValueKey];
                }
                // Try to parse as "Brand Model" format for vehicle models
                elseif ($fieldName === 'vehicle_model_id') {
                    $parts = explode(' ', $fieldValue, 2);
                    if (count($parts) == 2) {
                        $brandKey = strtolower($parts[0]);
                        $combinedKey = strtolower($fieldValue);
                        
                        // If we have a brand, we could potentially add a new model in the future
                        if (isset($referenceData['vehicle_brand_id'][$brandKey])) {
                            $warnings[] = __("common.csv_import.unknown_vehicle_model", [
                                'value' => $fieldValue,
                                'brand' => $parts[0]
                            ]);
                        } else {
                            $warnings[] = __("common.csv_import.unknown_vehicle_model_brand", ['value' => $fieldValue]);
                        }
                    } else {
                        $warnings[] = __("common.csv_import.unknown_vehicle_model", ['value' => $fieldValue, 'brand' => 'N/A']);
                    }
                }
                // Not found, add a warning
                else {
                    $warnings[] = __("common.csv_import.unknown_{$type}_{$fieldName}", ['value' => $fieldValue]);
                }
            }
        }
        
        // Special handling for driver country codes
        if ($type === 'driver' && !empty($row['card_issuing_country'])) {
            $countryInput = trim(strtolower($row['card_issuing_country']));
            
            // If it's already a valid 2-letter code (assuming uppercase)
            if (strlen($countryInput) === 2) {
                $row['card_issuing_country'] = strtoupper($countryInput);
            }
            // Otherwise try to map from country name to code
            elseif (isset($referenceData['countries'][$countryInput])) {
                $row['card_issuing_country'] = $referenceData['countries'][$countryInput];
            } else {
                $warnings[] = __("common.csv_import.unknown_country_code", ['value' => $row['card_issuing_country']]);
            }
        }
        
        // Format dates if needed for driver imports
        if ($type === 'driver') {
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
        }
        
        return [
            'row' => $row,
            'warnings' => $warnings
        ];
    }
} 