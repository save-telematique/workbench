<?php

namespace App\Services;

use App\Services\Import\ImporterInterface;
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
     * @param ImporterInterface $handler The importer handler for the specific import type
     * @return array Result of the import with mapping and parsed data
     */
    public function import(UploadedFile $file, ImporterInterface $handler): array
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

            // Map columns using AI and the handler
            $mapping = $this->mapColumns($fileData, $handler);

            // Process all rows using the determined mapping
            $parsedData = $this->processFileWithMapping($fullFilePath, $mapping, $handler);

            // Clean up temporary storage
            Storage::disk('public')->delete($filePath);

            return [
                'success' => true,
                'data' => $parsedData['rows'],
                'mapping' => $mapping,
                'warnings' => $parsedData['warnings'],
                'error' => null,
            ];
            
        } catch (\Exception $e) {
            Log::error("CSV/Excel import for {$handler->getFriendlyName()} failed: " . $e->getMessage());
            
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
     */
    private function loadFileData(string $filePath): array
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $sampleSize = 5; // Number of sample rows to extract
        
        try {
            $rows = Excel::toArray([], $filePath)[0] ?? [];
            
            if (empty($rows)) {
                return ['headers' => [], 'sample' => [], 'totalRows' => 0];
            }
            
            $headers = array_shift($rows); 
            $sample = array_slice($rows, 0, $sampleSize); 
            
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
     * Map columns using the AI or fallback for the import type.
     */
    private function mapColumns(array $fileData, ImporterInterface $handler): array
    {
        return $this->useAIToMapColumns(
            $fileData, 
            $handler->getTargetFields(), 
            $handler->getAiMappingContext(),
            $handler->getFallbackMappingKeywords()
        );
    }

    /**
     * Process the file using the determined mapping.
     */
    private function processFileWithMapping(string $filePath, array $mapping, ImporterInterface $handler): array
    {
        $processedRows = [];
        $warnings = [];
        $uniqueValues = [];
        
        try {
            $rows = Excel::toArray([], $filePath)[0] ?? [];
            
            if (empty($rows)) {
                return ['rows' => [], 'warnings' => []];
            }
            
            $headers = array_shift($rows); 
            
            $referenceData = $handler->preloadReferenceData();
            
            foreach ($rows as $rowIndex => $row) {
                if ($this->isEmptyRow($row)) {
                    continue;
                }
                
                $processedRow = [];
                
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
                
                $foreignKeyMappingResult = $handler->mapForeignKeysForRow($processedRow, $referenceData);
                $processedRow = $foreignKeyMappingResult['row'];
                
                if (!empty($foreignKeyMappingResult['warnings'])) {
                    foreach ($foreignKeyMappingResult['warnings'] as $warning) {
                        $warnings[] = [
                            'row' => $rowIndex + 2,
                            'message' => $warning,
                            'ignored' => false // Or determine based on warning type
                        ];
                    }
                }
                
                $uniqueField = $handler->getUniqueField();
                $friendlyName = $handler->getFriendlyName();
                if (!empty($processedRow[$uniqueField])) {
                    if (isset($uniqueValues[$uniqueField][$processedRow[$uniqueField]])) {
                        $warnings[] = [
                            'row' => $rowIndex + 2,
                            'message' => __("common.csv_import.duplicate_in_import", [
                                'row' => $rowIndex + 2, 
                                'field' => __("{$friendlyName}s.fields.{$uniqueField}") // Assumes translation key like devices.fields.imei
                            ]),
                            'ignored' => true
                        ];
                        continue;
                    }
                    $uniqueValues[$uniqueField][$processedRow[$uniqueField]] = true;
                }
                
                $validationResult = $this->validateRowData($processedRow, $handler->getRowValidationRules());
                
                if (!$validationResult['valid']) {
                    $warnings[] = [
                        'row' => $rowIndex + 2, 
                        'message' => __("common.csv_import.validation_failed", ['row' => $rowIndex + 2]),
                        'errors' => $validationResult['errors'],
                        'ignored' => false
                    ];
                    $processedRow['_validation'] = [
                        'valid' => false,
                        'errors' => $validationResult['errors']
                    ];
                } else {
                    $processedRow['_validation'] = [
                        'valid' => true,
                        'errors' => []
                    ];
                }
                
                $processedRows[] = $processedRow;
            }
            
            return [
                'rows' => $processedRows,
                'warnings' => $warnings
            ];
            
        } catch (\Exception $e) {
            Log::error("Error processing file for {$handler->getFriendlyName()}: " . $e->getMessage());
            throw new \Exception(__("common.csv_import.error_processing_file"));
        }
    }

    private function isEmptyRow(array $row): bool
    {
        if (empty($row)) return true;
        foreach ($row as $cell) {
            if ($cell !== null && $cell !== '' && trim($cell) !== '') return false;
        }
        return true;
    }

    private function useAIToMapColumns(array $fileData, array $targetFields, string $context, array $fallbackKeywords): array
    {
        try {
            $client = OpenAI::client(config('openai.api_key'));
            $headers = $fileData['headers'];
            $sample = $fileData['sample'];
            
            $sampleRows = [];
            foreach ($sample as $row) {
                $formattedRow = [];
                foreach ($headers as $index => $header) {
                    $value = $row[$index] ?? '';
                    $formattedRow[$header] = $value;
                }
                $sampleRows[] = $formattedRow;
            }
            
            $targetFieldsFormatted = [];
            foreach ($targetFields as $field => $description) {
                $targetFieldsFormatted[] = "- $field: $description";
            }
            
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

            $content = $response->choices[0]->message->content;
            if (preg_match('/```json(.*?)```/s', $content, $matches)) {
                $jsonString = $matches[1];
            } else {
                $jsonString = $content;
            }
            
            $jsonString = preg_replace('/```(json)?|```/', '', $jsonString);
            $mapping = json_decode($jsonString, true);
            
            if (!$mapping || json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Failed to parse AI response: " . json_last_error_msg());
            }
            
            return $mapping;
            
        } catch (\Exception $e) {
            Log::error('Column mapping with AI failed: ' . $e->getMessage());
            
            $mapping = [];
            foreach (array_keys($targetFields) as $targetField) {
                $mapping[$targetField] = $this->findBestColumnMatch($targetField, $fileData['headers'], $fallbackKeywords[$targetField] ?? []);
            }
            return $mapping;
        }
    }

    private function findBestColumnMatch(string $targetField, array $headers, array $keywords): ?string
    {
        $targetFieldLower = strtolower(str_replace('_', '', $targetField));

        // Exact match or direct variations
        foreach ($headers as $header) {
            $headerLower = strtolower(str_replace('_', '', $header));
            if ($headerLower === $targetFieldLower) return $header;
            if (strpos($headerLower, $targetFieldLower) !== false) return $header;
            if (strpos($targetFieldLower, $headerLower) !== false && strlen($headerLower) > 2) return $header; // e.g. target 'device_type_id', header 'type'
        }

        // Keyword based matching
        if (!empty($keywords)) {
            foreach ($headers as $header) {
                $headerLower = strtolower($header);
                foreach ($keywords as $keyword) {
                    if (strpos($headerLower, strtolower($keyword)) !== false) {
                        return $header;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Validate row data against given rules.
     */
    private function validateRowData(array $row, array $rules): array
    {
        $validator = Validator::make($row, $rules);
        return [
            'valid' => !$validator->fails(),
            'errors' => $validator->errors()->all()
        ];
    }

    /**
     * Validate a single row for frontend live validation
     */
    public function validateSingleRow(array $rowData, ImporterInterface $handler): array
    {
        $result = [
            'valid' => true,
            'errors' => [],
            'warnings' => [],
            'field_errors' => []
        ];
        
        try {
            $referenceData = $handler->preloadReferenceData();
            $foreignKeyMappingResult = $handler->mapForeignKeysForRow($rowData, $referenceData);
            $validatedRowData = $foreignKeyMappingResult['row'];
            
            if (!empty($foreignKeyMappingResult['warnings'])) {
                $result['warnings'] = $foreignKeyMappingResult['warnings'];
            }
            
            $rules = $handler->getRowValidationRules();
            // For unique checks in live validation, we might need different rule sets or context
            // E.g., remove unique checks or make them conditional if they are too slow.
            // For now, using the same row validation rules. Add specific logic in handler if needed.
            $validator = Validator::make($validatedRowData, $rules);
            
            if ($validator->fails()) {
                $result['valid'] = false;
                $result['errors'] = $validator->errors()->all();
                foreach ($validator->errors()->messages() as $field => $messages) {
                    $result['field_errors'][$field] = $messages;
                }
            }
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error("Row validation for {$handler->getFriendlyName()} failed: " . $e->getMessage());
            return [
                'valid' => false,
                'errors' => [$e->getMessage()],
                'warnings' => [],
                'field_errors' => []
            ];
        }
    }
} 