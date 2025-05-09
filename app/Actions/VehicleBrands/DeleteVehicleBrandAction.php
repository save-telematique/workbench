<?php

namespace App\Actions\VehicleBrands;

use App\Models\VehicleBrand;
use Illuminate\Support\Facades\Storage;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteVehicleBrandAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->vehicle_brand);
    }

    public function handle(VehicleBrand $vehicleBrand): bool
    {
        // Delete logo if exists
        if ($vehicleBrand->logo_url) {
            $path = str_replace('/storage/', '', $vehicleBrand->logo_url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        return $vehicleBrand->delete();
    }

    public function asController(ActionRequest $request, VehicleBrand $vehicleBrand)
    {
        $this->handle($vehicleBrand);

        return to_route('global-settings.vehicle-brands.index')
            ->with('success', 'vehicle_brands.deleted');
    }
} 