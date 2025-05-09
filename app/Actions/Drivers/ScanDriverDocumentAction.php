<?php

namespace App\Actions\Drivers;

use App\Models\Driver;
use App\Services\ImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class ScanDriverDocumentAction
{
    use AsAction;

    protected $imageAnalysisService;

    public function __construct(ImageAnalysisService $imageAnalysisService)
    {
        $this->imageAnalysisService = $imageAnalysisService;
    }

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Driver::class) || 
               $request->user()->can('update', Driver::class);
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
            'file.required' => __('drivers.scan.error_no_image'),
            'file.file' => __('drivers.scan.error_invalid_format'),
            'file.mimes' => __('drivers.scan.error_invalid_format'),
            'file.max' => __('drivers.scan.error_file_too_large'),
        ];
    }

    /**
     * Execute the action.
     */
    public function handle(ActionRequest $request): array
    {
        try {
            // Use the image analysis service to extract data
            $result = $this->imageAnalysisService->analyze($request->file('file'), 'driver');
            
            return [
                'success' => true,
                'data' => $result,
                'error' => null
            ];
        } catch (\Exception $e) {
            Log::error('Driver document scanning failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'data' => null,
                'error' => $e->getMessage()
            ];
        }
    }

    public function asController(ActionRequest $request): JsonResponse
    {
        $result = $this->handle($request);
        
        return response()->json($result);
    }
} 