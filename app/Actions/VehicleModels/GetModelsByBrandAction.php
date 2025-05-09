<?php

namespace App\Actions\VehicleModels;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class GetModelsByBrandAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('viewAny', VehicleModel::class);
    }

    public function handle(VehicleBrand $vehicleBrand): array
    {
        return VehicleModel::where('vehicle_brand_id', $vehicleBrand->id)
            ->orderBy('name')
            ->get()
            ->map(function ($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'brand_id' => $model->vehicle_brand_id,
                ];
            })
            ->toArray();
    }

    public function asController(ActionRequest $request, VehicleBrand $vehicleBrand): JsonResponse
    {
        $models = $this->handle($vehicleBrand);
        
        return response()->json($models);
    }
} 