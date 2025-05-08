<?php

namespace App\Services\Import;

use App\Models\Vehicle;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use App\Models\VehicleBrand;

class VehicleImporter implements ImporterInterface
{
    public function getModelClass(): string
    {
        return Vehicle::class;
    }

    public function getRequiredPermission(): string
    {
        return 'create_vehicles';
    }

    public function getRequestArrayName(): string
    {
        return 'vehicles';
    }

    public function getInertiaPageName(): string
    {
        return 'vehicles/import';
    }

    public function getTargetFields(): array
    {
        return [
            'registration' => 'Registration Number/License Plate (required)',
            'vin' => 'VIN - Vehicle Identification Number (required)',
            'vehicle_model_id' => 'Vehicle Model (e.g., Scania R450 or just R450 if brand is known) (required)',
            'vehicle_type_id' => 'Vehicle Type (required)',
            'notes' => 'Notes (optional)',
        ];
    }

    public function getMandatoryFields(): array
    {
        return ['registration', 'vin', 'vehicle_model_id', 'vehicle_type_id'];
    }

    public function getUniqueField(): string
    {
        return 'registration';
    }

    public function getRowValidationRules(): array
    {
        return [
            'registration' => 'required|string|max:255|unique:vehicles,registration,NULL,id,tenant_id,' . (request()->input('tenant_id') ?? tenant('id')),
            'vin' => 'required|string|max:17|min:17|unique:vehicles,vin,NULL,id,tenant_id,' . (request()->input('tenant_id') ?? tenant('id')),
            'vehicle_model_id' => 'required|exists:vehicle_models,id',
            'vehicle_type_id' => 'required|exists:vehicle_types,id',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function getStoreRequestValidationRules(): array
    {
        $arrayName = $this->getRequestArrayName();
        return [
            $arrayName => 'required|array',
            "{$arrayName}.*.registration" => 'required|string|max:255|unique:vehicles,registration,NULL,id,tenant_id,' . (request()->input('tenant_id') ?? tenant('id')),
            "{$arrayName}.*.vin" => 'required|string|max:17|min:17|unique:vehicles,vin,NULL,id,tenant_id,' . (request()->input('tenant_id') ?? tenant('id')),
            "{$arrayName}.*.vehicle_model_id" => 'required|exists:vehicle_models,id',
            "{$arrayName}.*.vehicle_type_id" => 'required|exists:vehicle_types,id',
            "{$arrayName}.*.notes" => 'nullable|string|max:1000',
            'tenant_id' => 'nullable|exists:tenants,id',
        ];
    }

    public function getForeignKeyConfigs(): array
    {
        return [
            'vehicle_model_id' => [
                'model' => VehicleModel::class,
                'field' => 'name', // Model name
                'id_field' => 'id',
                'relation' => 'vehicleBrand', // Relation on VehicleModel to get Brand
                'combined_field' => 'name', // Field on VehicleBrand (e.g., brand name)
            ],
            'vehicle_type_id' => [
                'model' => VehicleType::class,
                'field' => 'name',
                'id_field' => 'id',
            ],
        ];
    }

    public function getAiMappingContext(): string
    {
        $vehicleTypes = VehicleType::all()->pluck('name')->implode(', ');
        $vehicleBrands = VehicleBrand::with('models')->get();
        $modelsContext = '';
        foreach ($vehicleBrands as $brand) {
            $models = $brand->models->pluck('name')->implode(', ');
            $modelsContext .= "Brand: {$brand->name}, Models: {$models}; ";
        }
        return "These are vehicle records. Registration is the license plate. VIN is a 17-char ID. " .
               "Vehicle model can be just model name (e.g. 'Actros') or brand + model (e.g. 'Mercedes Actros'). " .
               "Available vehicle types are: {$vehicleTypes}. " .
               "Available vehicle brands and their models are: {$modelsContext}";
    }

    public function preloadReferenceData(): array
    {
        $data = [];
        $fkConfigs = $this->getForeignKeyConfigs();

        // Vehicle Types
        $typeConfig = $fkConfigs['vehicle_type_id'];
        $data['vehicle_type_id'] = $typeConfig['model']::all()->pluck($typeConfig['id_field'], $typeConfig['field'])
            ->mapWithKeys(fn($id, $name) => [strtolower(trim($name)) => $id])->toArray();

        // Vehicle Models (and Brand-Model combinations)
        $modelConfig = $fkConfigs['vehicle_model_id'];
        $models = $modelConfig['model']::with($modelConfig['relation'])->get();
        $data['vehicle_model_id'] = []; // For model name only
        $data['vehicle_model_id_with_brand'] = []; // For "Brand Model" string

        foreach ($models as $model) {
            $modelNameKey = strtolower(trim($model->{$modelConfig['field']}));
            // Prioritize specific model if multiple models have same name but different brands
            if (!isset($data['vehicle_model_id'][$modelNameKey])) {
                 $data['vehicle_model_id'][$modelNameKey] = $model->{$modelConfig['id_field']};
            }
            if ($model->{$modelConfig['relation']}) {
                $brandName = $model->{$modelConfig['relation']}->{$modelConfig['combined_field']};
                $combinedKey = strtolower(trim($brandName . ' ' . $model->{$modelConfig['field']}));
                $data['vehicle_model_id_with_brand'][$combinedKey] = $model->{$modelConfig['id_field']};
            }
        }
        return $data;
    }

    public function mapForeignKeysForRow(array $row, array $referenceData): array
    {
        $warnings = [];

        // Vehicle Type
        $fieldName = 'vehicle_type_id';
        if (!empty($row[$fieldName]) && is_string($row[$fieldName])) {
            $valueKey = strtolower(trim($row[$fieldName]));
            if (isset($referenceData[$fieldName][$valueKey])) {
                $row[$fieldName] = $referenceData[$fieldName][$valueKey];
            } else {
                $warnings[] = __('common.csv_import.unknown_value_for_field', ['value' => $row[$fieldName], 'field' => 'Vehicle Type']);
            }
        }

        // Vehicle Model (tries combined first, then model name only)
        $fieldName = 'vehicle_model_id';
        if (!empty($row[$fieldName]) && is_string($row[$fieldName])) {
            $valueKey = strtolower(trim($row[$fieldName]));
            if (isset($referenceData['vehicle_model_id_with_brand'][$valueKey])) {
                $row[$fieldName] = $referenceData['vehicle_model_id_with_brand'][$valueKey];
            } elseif (isset($referenceData['vehicle_model_id'][$valueKey])) {
                $row[$fieldName] = $referenceData['vehicle_model_id'][$valueKey];
            } else {
                 // Try to parse as "Brand Model" format to give a more specific warning
                $parts = explode(' ', trim($row[$fieldName]), 2);
                if (count($parts) == 2) {
                     $warnings[] = __("common.csv_import.unknown_vehicle_model_brand_combo", ['value' => $row[$fieldName], 'brand' => $parts[0], 'model' => $parts[1]]);
                } else {
                    $warnings[] = __('common.csv_import.unknown_value_for_field', ['value' => $row[$fieldName], 'field' => 'Vehicle Model']);
                }
            }
        }
        return ['row' => $row, 'warnings' => $warnings];
    }

    public function getFormData(): array
    {
        return [
            'vehicleTypes' => VehicleType::orderBy('name')->get(),
            'vehicleBrands' => VehicleBrand::with('models')->orderBy('name')->get(),
        ];
    }

    public function createEntity(array $data): object
    {
        // vehicle_brand_id is not directly imported but derived if model implies it
        // However, the form might submit vehicle_model_id which is what we need.
        // If `vehicle_brand_id` was part of the CSV, it would need mapping or handling.
        // Here, we assume `vehicle_model_id` correctly refers to `vehicle_models.id` after mapping.
        if (isset($data['vehicle_model_id'])) {
            $model = VehicleModel::find($data['vehicle_model_id']);
            if ($model) {
                $data['vehicle_brand_id'] = $model->vehicle_brand_id; 
            }
        }
        return new Vehicle($data);
    }
    
    public function getFallbackMappingKeywords(): array
    {
        return [
            'registration' => ['plate', 'license plate', 'reg number', 'immatriculation'],
            'vin' => ['vin number', 'chassis number', 'vehicle id'],
            'vehicle_model_id' => ['model', 'vehicle model', 'make and model', 'type de vehicule', 'modele'],
            'vehicle_type_id' => ['type', 'category', 'vehicle class', 'usage type', 'genre'],
            'year' => ['mfg year', 'production year', 'annee'],
            'color' => ['colour', 'couleur'],
            'notes' => ['comment', 'description', 'remarques'],
        ];
    }

    public function getFriendlyName(): string
    {
        return 'vehicle';
    }
} 