<?php

namespace App\Actions\Geofences;

use App\Models\Geofence;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateGeofenceAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Geofence::class);
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'geojson' => 'required|array',
            'geojson.type' => 'required|string|in:Polygon,MultiPolygon',
            'geojson.coordinates' => 'required|array',
            'is_active' => 'boolean',
        ];

        // Group validation with tenant isolation
        if (tenant('id')) {
            // In tenant context, group must belong to the current tenant
            $rules['group_id'] = [
                'nullable',
                'uuid',
                'exists:groups,id,tenant_id,' . tenant('id') . ',deleted_at,NULL'
            ];
        } else {
            // In central context, group must belong to the specified tenant
            $rules['group_id'] = [
                'nullable',
                'uuid',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $tenantId = request('tenant_id');
                        if (!$tenantId) {
                            $fail(__('validation.custom.group_requires_tenant'));
                            return;
                        }
                        
                        $group = \App\Models\Group::where('id', $value)
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                            ->first();
                            
                        if (!$group) {
                            $fail(__('validation.custom.group_not_in_tenant'));
                        }
                    }
                }
            ];
        }

        return $rules;
    }

    public function getValidationMessages(): array
    {
        return [
            'name.required' => __('geofences.validation.name_required'),
            'geojson.required' => __('geofences.validation.geojson_required'),
            'geojson.type.in' => __('geofences.validation.geojson_type_invalid'),
        ];
    }

    public function handle(array $data): Geofence
    {
        // Set tenant_id based on context
        if (tenant('id')) {
            $data['tenant_id'] = tenant('id');
        } elseif (!isset($data['tenant_id'])) {
            throw new \InvalidArgumentException('tenant_id is required in central context');
        }

        // Set default values
        $data['is_active'] = $data['is_active'] ?? true;

        return Geofence::create($data);
    }

    public function asController(ActionRequest $request)
    {
        $geofence = $this->handle($request->validated());

        return to_route('geofences.show', $geofence)
            ->with('success', __('geofences.messages.created'));
    }
} 