<?php

namespace App\Actions\VehicleBrands;

use App\Models\VehicleBrand;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateVehicleBrandAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->vehicle_brand);
    }

    public function rules(ActionRequest $request): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:vehicle_brands,name,' . $request->vehicle_brand->id],
            'logo' => ['nullable', 'image', 'max:1024'],
        ];
    }

    public function handle(VehicleBrand $vehicleBrand, array $data, ?UploadedFile $logo = null): VehicleBrand
    {
        if ($logo) {
            // Delete old logo if exists
            if ($vehicleBrand->logo_url) {
                $oldPath = str_replace('/storage/', '', $vehicleBrand->logo_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $logo->store('vehicle-brands', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        $vehicleBrand->update($data);
        
        return $vehicleBrand;
    }

    public function asController(ActionRequest $request, VehicleBrand $vehicleBrand)
    {
        $this->handle(
            $vehicleBrand,
            $request->validated(),
            $request->hasFile('logo') ? $request->file('logo') : null
        );

        return to_route('global-settings.vehicle-brands.index')
            ->with('success', 'vehicle_brands.updated');
    }
} 