<?php

namespace App\Actions\Devices;

use App\Models\Device;
use App\Models\DeviceType;
use App\Services\ImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class ScanQrCodeAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Device::class);
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:jpeg,png,jpg,webp,pdf',
                'max:10240', // 10MB limit
            ],
        ];
    }

    public function getValidationMessages(): array
    {
        return [
            'file.required' => __('devices.scan.error_no_image'),
            'file.file' => __('devices.scan.error_invalid_format'),
            'file.mimes' => __('devices.scan.error_invalid_format'),
            'file.max' => __('devices.scan.error_file_too_large'),
        ];
    }

    public function handle(UploadedFile $file, ImageAnalysisService $imageAnalysisService): array
    {
        try {
            // Use the image analysis service to extract data
            $result = $imageAnalysisService->analyze($file, 'device');

            if ($result['success'] && !empty($result['data'])) {
                // Find the device type ID based on the type name
                $deviceTypeName = $result['data']['device_type'] ?? null;
                if ($deviceTypeName) {
                    $deviceType = DeviceType::where('name', 'like', "%{$deviceTypeName}%")->first();
                    if ($deviceType) {
                        $result['data']['device_type_id'] = $deviceType->id;
                    }
                }
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('QR code scanning failed: ' . $e->getMessage());
            return [
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function asController(ActionRequest $request): JsonResponse
    {
        $result = $this->handle($request->file('file'));
        return response()->json($result);
    }
} 