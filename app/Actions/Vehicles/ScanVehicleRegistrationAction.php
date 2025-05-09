<?php

namespace App\Actions\Vehicles;

use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Services\ImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Lorisleiva\Actions\Concerns\AsAction;
use Lorisleiva\Actions\ActionRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Contracts\Auth\Access\Gate as GateContract;

class ScanVehicleRegistrationAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Vehicle::class);
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:jpeg,png,jpg,webp,pdf',
                'max:10240',
            ],
        ];
    }
    
    public function getValidationMessages(): array
    {
        return [
            'file.required' => __('vehicles.scan.error_no_image'),
            'file.file' => __('vehicles.scan.error_invalid_format'),
            'file.mimes' => __('vehicles.scan.error_invalid_format'),
            'file.max' => __('vehicles.scan.error_file_too_large'),
        ];
    }

    public function handle(array $validatedData, ImageAnalysisService $imageAnalysisService): array
    {
        $result = $imageAnalysisService->analyze($validatedData['file'], 'vehicle');
        
        if ($result['success'] && !empty($result['data'])) {
            $vehicleData = $result['data'];
            $brandName = $vehicleData['brand'] ?? null;
            $modelName = $vehicleData['model'] ?? null;
            
            if ($brandName) {
                $matchingBrand = VehicleBrand::where('name', 'LIKE', "%{$brandName}%")
                    ->orWhere(function($query) use ($brandName) {
                        $query->whereRaw("LOWER(name) LIKE ?", ["%" . strtolower($brandName) . "%"]);
                    })
                    ->first();
                
                if ($matchingBrand) {
                    $result['data']['brand_id'] = $matchingBrand->id;
                    
                    if ($modelName) {
                        $matchingModel = VehicleModel::where('vehicle_brand_id', $matchingBrand->id)
                            ->where(function($query) use ($modelName) {
                                $query->where('name', 'LIKE', "%{$modelName}%")
                                    ->orWhere(function($q) use ($modelName) {
                                        $q->whereRaw("LOWER(name) LIKE ?", ["%" . strtolower($modelName) . "%"]);
                                    });
                            })
                            ->first();
                        
                        if ($matchingModel) {
                            $result['data']['model_id'] = $matchingModel->id;
                        }
                    }
                }
            }
        }
        return $result;
    }

    public function asController(ActionRequest $request, ImageAnalysisService $imageAnalysisService)
    {
        $result = $this->handle($request->validated(), $imageAnalysisService);
       
        return $result;
    }
} 