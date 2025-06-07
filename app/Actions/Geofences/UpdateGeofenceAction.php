<?php

namespace App\Actions\Geofences;

use App\Models\Geofence;
use Illuminate\Validation\Rule;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateGeofenceAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('update', $request->geofence);
    }

    public function rules(ActionRequest $request): array
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
            // In central context, group must belong to the same tenant as the geofence
            $rules['group_id'] = [
                'nullable',
                'uuid',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value) {
                        $geofenceTenantId = $request->geofence->tenant_id;
                        
                        $group = \App\Models\Group::where('id', $value)
                            ->where('tenant_id', $geofenceTenantId)
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

    public function handle(Geofence $geofence, array $data): Geofence
    {
        $geofence->update($data);
        return $geofence->fresh();
    }

    public function asController(ActionRequest $request)
    {
        $geofence = $this->handle($request->geofence, $request->validated());

        return to_route('geofences.show', $geofence)
            ->with('success', __('geofences.messages.updated'));
    }
} 