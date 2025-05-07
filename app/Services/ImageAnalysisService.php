<?php

namespace App\Services;

use App\Models\DeviceType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use OpenAI;
use Illuminate\Http\File;

class ImageAnalysisService
{
    /**
     * Analyze an image using OpenAI to extract information.
     *
     * @param UploadedFile $file The uploaded file (image or PDF) to analyze
     * @param string $type The type of image analysis to perform (e.g., 'vehicle', 'device')
     * @return array Result of the analysis with success status and extracted data
     */
    public function analyze(UploadedFile $file, string $type): array
    {
        $result = [
            'success' => false,
            'data' => null,
            'error' => null,
        ];

        try {
            // Check if the file is a PDF and convert it to an image if needed
            $fileType = $file->getMimeType();
            if ($fileType === 'application/pdf') {
                $file = $this->convertPdfToImage($file);
                if (!$file) {
                    throw new \Exception(__("common.image_analysis.error_converting_pdf"));
                }
            }

            // Store the uploaded image temporarily
            $imagePath = $file->store('temp/image-analysis', 'public');
            $fullImagePath = Storage::disk('public')->path($imagePath);

            if (!file_exists($fullImagePath) || !is_readable($fullImagePath)) {
                throw new \Exception(__("common.image_analysis.error_reading_file"));
            }

            // Get base64 encoded image content
            $imageData = base64_encode(file_get_contents($fullImagePath));

            if (empty($imageData)) {
                throw new \Exception(__("common.image_analysis.error_empty_image"));
            }

            // Call the appropriate analysis method based on the type
            switch ($type) {
                case 'vehicle':
                    $result = $this->analyzeVehicleRegistration($imageData);
                    break;
                case 'device':
                    $result = $this->analyzeDeviceQrCode($imageData);
                    break;
                case 'driver':
                    $result = $this->analyzeDriverDocument($imageData);
                    break;
                default:
                    throw new \Exception(__("common.image_analysis.invalid_type"));
            }

            // Clean up temporary storage
            Storage::disk('public')->delete($imagePath);

            return $result;
            
        } catch (\Exception $e) {
            Log::error('Image analysis failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Convert a PDF file to an image.
     * Note: Requires the Imagick PHP extension to be installed.
     *
     * @param \Illuminate\Http\UploadedFile $pdfFile
     * @return \Illuminate\Http\UploadedFile|null
     */
    private function convertPdfToImage(\Illuminate\Http\UploadedFile $pdfFile)
    {
        try {
            // Store the PDF temporarily
            $pdfPath = $pdfFile->store('temp/pdf-conversion', 'public');
            $fullPdfPath = Storage::disk('public')->path($pdfPath);
            
            // Create temp directories if they don't exist
            $tempDir = storage_path('app/public/temp/pdf-conversion');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            // Generate a unique name for the output image
            $outputImageName = uniqid('pdf_converted_') . '.jpg';
            $outputImagePath = Storage::disk('public')->path('temp/pdf-conversion/' . $outputImageName);
            
            // Use Imagick to convert PDF to image (first page only)
            // @phpstan-ignore-next-line
            $imagick = new \Imagick();
            $imagick->setResolution(300, 300); // Set higher resolution for better quality
            $imagick->readImage($fullPdfPath . '[0]'); // Read only the first page
            $imagick->setImageFormat('jpeg');
            // @phpstan-ignore-next-line
            $imagick->setImageCompression(\Imagick::COMPRESSION_JPEG);
            $imagick->setImageCompressionQuality(90); // High quality
            $imagick->writeImage($outputImagePath);
            $imagick->clear();
            
            // Clean up the PDF file
            Storage::disk('public')->delete($pdfPath);
            
            // Create a new UploadedFile instance from the converted image
            $imageFile = new \Illuminate\Http\UploadedFile(
                $outputImagePath,
                $outputImageName,
                'image/jpeg',
                null,
                true // Test file
            );
            
            return $imageFile;
        } catch (\Exception $e) {
            Log::error('PDF to image conversion failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Analyze a vehicle registration image to extract relevant vehicle information.
     *
     * @param string $imageData Base64 encoded image
     * @return array Result with extracted vehicle data
     */
    private function analyzeVehicleRegistration(string $imageData): array
    {
        // Get all available brands and models to provide to the AI
        $brands = \App\Models\VehicleBrand::all();
        $brandOptions = $brands->pluck('name')->implode(', ');
        
        // Prepare models data organized by brand
        $modelsByBrand = [];
        foreach ($brands as $brand) {
            $models = \App\Models\VehicleModel::where('vehicle_brand_id', $brand->id)->get();
            if ($models->count() > 0) {
                $modelsByBrand[$brand->name] = $models->pluck('name')->toArray();
            }
        }

        // Format models by brand for the prompt
        $modelOptions = '';
        foreach ($modelsByBrand as $brandName => $models) {
            $modelOptions .= "Brand: {$brandName}, Models: " . implode(', ', $models) . ";\n";
        }

        $client = OpenAI::client(config('openai.api_key'));
        
        $response = $client->chat()->create([
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an assistant that extracts information from vehicle registration documents. 
                    Focus on extracting exactly these fields if visible:
                    1. Vehicle registration number
                    2. VIN number (Vehicle Identification Number)
                    3. Brand/Make of the vehicle
                    4. Model of the vehicle
                    5. First registration date (if available)
                    
                    Available brands in the system: ' . $brandOptions . '
                    
                    Available models by brand:
                    ' . $modelOptions . '
                    
                    IMPORTANT: For brand and model, you MUST ONLY return values from the lists provided above.
                    If the exact match is not found, find the closest match or return null.
                    
                    Return ONLY a JSON object with these fields: 
                    {
                        "registration": string,
                        "vin": string,
                        "brand": string (MUST be from the list of available brands or null),
                        "model": string (MUST be from the list of available models for the matched brand or null),
                        "first_registration_date": string (in ISO format or null)
                    }
                    
                    If you cannot read or find a particular field, use null for that field.
                    Be especially attentive to the format of the document - it may be a European registration card,
                    a certificate of conformity, or other official vehicle documentation.'
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Analyze this image of a vehicle registration document and extract all relevant information. 
                            Focus on the registration number, VIN, brand/make, model, and first registration date.
                            Remember to ONLY use brands and models from the lists I provided.
                            Return the data in JSON format.
                            If you cannot find a brand or model, try to find it by decoding the VIN or other information.'
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:image/jpeg;base64,{$imageData}"
                            ]
                        ]
                    ]
                ]
            ]
        ]);

        // Process the response
        $content = $response->choices[0]->message->content;
        
        // Try to extract JSON from the response
        if (preg_match('/```json(.*?)```/s', $content, $matches)) {
            $jsonString = $matches[1];
        } else {
            $jsonString = $content;
        }
        
        // Clean and decode the JSON
        $jsonString = preg_replace('/```(json)?|```/', '', $jsonString);
        $vehicleData = json_decode($jsonString, true);
        
        if (!$vehicleData || json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Failed to parse AI response: " . json_last_error_msg());
        }

        // Validate the extracted data
        if (empty($vehicleData['registration']) && empty($vehicleData['vin']) && 
            empty($vehicleData['brand']) && empty($vehicleData['model'])) {
            throw new \Exception(__('vehicles.scan.error_no_data_extracted'));
        }

        return [
            'success' => true,
            'data' => $vehicleData,
            'error' => null,
        ];
    }

    /**
     * Analyze a device QR code to extract relevant device information.
     *
     * @param string $imageData Base64 encoded image
     * @return array Result with extracted device data
     */
    private function analyzeDeviceQrCode(string $imageData): array
    {
        $client = OpenAI::client(config('openai.api_key'));
        
        $response = $client->chat()->create([
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an assistant that extracts information from images of telematics devices. 
                    Look for QR codes, barcodes, plain text and device model information on the device. 
                    Extract exactly these fields if visible: IMEI, serial number (SN), firmware version, and most importantly, the device type/model.
                    The device model/type can only be one of the following: ' . DeviceType::all()->pluck('name')->implode(', ') . 'if none is matching return null.
                    Return ONLY a JSON object with these fields: imei, serial_number, firmware_version, and device_type (this is crucial).'
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Analyze this image of a telematics device and extract all relevant information. 
                            Pay special attention to QR codes, the IMEI number, serial number, and the device model/type.
                            Return the data in JSON format.'
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:image/jpeg;base64,{$imageData}"
                            ]
                        ]
                    ]
                ]
            ]
        ]);

        // Process the response
        $content = $response->choices[0]->message->content;
        
        // Try to extract JSON from the response
        if (preg_match('/```json(.*?)```/s', $content, $matches)) {
            $jsonString = $matches[1];
        } else {
            $jsonString = $content;
        }
        
        // Clean and decode the JSON
        $jsonString = preg_replace('/```(json)?|```/', '', $jsonString);
        $deviceData = json_decode($jsonString, true);
        
        if (!$deviceData || json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Failed to parse AI response: " . json_last_error_msg());
        }

        // Validate the extracted data
        if (empty($deviceData['imei']) && empty($deviceData['serial_number']) && empty($deviceData['device_type'])) {
            throw new \Exception(__('devices.scan.error_no_data_extracted'));
        }

        return [
            'success' => true,
            'data' => $deviceData,
            'error' => null,
        ];
    }

    /**
     * Analyze a driver document to extract relevant driver information.
     *
     * @param string $imageData Base64 encoded image
     * @return array Result with extracted driver data
     */
    private function analyzeDriverDocument(string $imageData): array
    {
        $client = OpenAI::client(config('openai.api_key'));
        
        $response = $client->chat()->create([
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an assistant that extracts information from driver license documents. 
                    Focus on extracting exactly these fields if visible and distinguish between the license number and card number:
                    
                    1. First name of the driver
                    2. Last name of the driver
                    3. Date of birth (in ISO format YYYY-MM-DD if possible)
                    4. License number/identifier (the main identifying number of the driver)
                    5. Card number (document number that changes with each renewal - often on the back)
                    6. License class/category
                    7. Issue date (in ISO format YYYY-MM-DD if possible)
                    8. Expiry date (in ISO format YYYY-MM-DD if possible)
                    9. Country code (in ISO 3166-1 alpha-2 format, e.g. "FR" for France, "BE" for Belgium)
                    
                    Return ONLY a JSON object with these fields: 
                    {
                        "first_name": string,
                        "last_name": string,
                        "date_of_birth": string,
                        "license_number": string,
                        "card_number": string,
                        "license_class": string,
                        "issue_date": string,
                        "expiry_date": string,
                        "country_code": string
                    }
                    
                    If you cannot read or find a particular field, use null for that field.
                    
                    IMPORTANT DISTINCTION:
                    - The license number identifies the PERSON and usually stays the same when renewed
                    - The card number identifies the PHYSICAL DOCUMENT and changes with each renewal
                    
                    For the country code, try to identify the issuing country from any visual clues, country names, flags, or EU symbols on the document.
                    Be especially attentive to the format of the document - it may be a European driver license card,
                    an international driving permit, or other official driver documentation.'
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Analyze this image of a driver license document and extract all relevant information. 
                            Make sure to distinguish between the license number (identifies the person) and the card number (identifies the physical document).
                            Focus on the name, date of birth, both numbers, class/category, issue date, expiry date, and country code.
                            Return the data in JSON format.'
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:image/jpeg;base64,{$imageData}"
                            ]
                        ]
                    ]
                ]
            ]
        ]);

        // Process the response
        $content = $response->choices[0]->message->content;
        
        // Try to extract JSON from the response
        if (preg_match('/```json(.*?)```/s', $content, $matches)) {
            $jsonString = $matches[1];
        } else {
            $jsonString = $content;
        }
        
        // Clean and decode the JSON
        $jsonString = preg_replace('/```(json)?|```/', '', $jsonString);
        $driverData = json_decode($jsonString, true);
        
        if (!$driverData || json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Failed to parse AI response: " . json_last_error_msg());
        }

        // Validate the extracted data
        if (empty($driverData['first_name']) && empty($driverData['last_name']) && 
            empty($driverData['license_number'])) {
            throw new \Exception(__('drivers.scan.error_no_data_extracted'));
        }

        return [
            'success' => true,
            'data' => $driverData,
            'error' => null,
        ];
    }
} 