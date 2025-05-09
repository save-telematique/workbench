<?php

namespace App\Actions\VehicleBrands;

use App\Models\VehicleBrand;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateVehicleBrandAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', VehicleBrand::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:vehicle_brands,name'],
            'logo' => ['nullable', 'image', 'max:1024'],
        ];
    }

    public function handle(array $data, ?UploadedFile $logo = null): VehicleBrand
    {
        if ($logo) {
            $path = $logo->store('vehicle-brands', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        return VehicleBrand::create($data);
    }

    public function asController(ActionRequest $request)
    {
        $this->handle(
            $request->validated(), 
            $request->hasFile('logo') ? $request->file('logo') : null
        );

        return to_route('global-settings.vehicle-brands.index')
            ->with('success', 'vehicle_brands.created');
    }
} 