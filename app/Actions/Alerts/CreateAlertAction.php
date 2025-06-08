<?php

namespace App\Actions\Alerts;

use App\Models\Alert;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class CreateAlertAction
{
    use AsAction;

    public function handle(array $data): Alert
    {
        // Créer l'alerte
        $alert = Alert::create($data);
        
        // Calculer les utilisateurs éligibles et les assigner automatiquement
        $eligibleUsers = $this->calculateEligibleUsers($alert);
        $this->assignAlertToUsers($alert, $eligibleUsers);
        
        return $alert->load('users');
    }

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('create', Alert::class);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|string|max:255',
            'severity' => 'required|in:info,warning,error,success',
            'metadata' => 'nullable|array',
            'alertable_type' => 'required|string',
            'alertable_id' => 'required',
            'tenant_id' => 'nullable|exists:tenants,id',
            'expires_at' => 'nullable|date|after:now',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Calculer tous les utilisateurs éligibles pour voir cette alerte
     */
    public function calculateEligibleUsers(Alert $alert): Collection
    {
        $eligibleUsers = collect();

        // Super admins peuvent toujours voir toutes les alertes
        $eligibleUsers = $eligibleUsers->merge(
            User::whereHas('roles', function ($query) {
                $query->where('name', 'super_admin');
            })->get()
        );

        // Si l'alerte est liée à un tenant
        if ($alert->tenant_id) {
            $tenantUsers = $this->getTenantEligibleUsers($alert);
            $eligibleUsers = $eligibleUsers->merge($tenantUsers);
        } else {
            // Alerte centrale : utilisateurs centraux avec permission
            $centralUsers = User::whereNull('tenant_id')
                ->permission('view_alerts')
                ->get();
            $eligibleUsers = $eligibleUsers->merge($centralUsers);
        }

        return $eligibleUsers->unique('id');
    }

    /**
     * Obtenir les utilisateurs du tenant éligibles
     */
    protected function getTenantEligibleUsers(Alert $alert): Collection
    {
        $tenantUsers = User::where('tenant_id', $alert->tenant_id)
            ->permission('view_alerts')
            ->with('groups')
            ->get();

        // Si l'alerte est liée à une entité avec groupes
        if ($this->entityHasGroups($alert)) {
            return $this->filterUsersByEntityGroups($alert, $tenantUsers);
        }

        return $tenantUsers;
    }

    /**
     * Vérifier si l'entité de l'alerte supporte les groupes
     */
    protected function entityHasGroups(Alert $alert): bool
    {
        $entitiesWithGroups = [
            'App\\Models\\Vehicle',
            'App\\Models\\Driver',
        ];

        return in_array($alert->alertable_type, $entitiesWithGroups);
    }

    /**
     * Filtrer les utilisateurs selon les groupes de l'entité
     */
    protected function filterUsersByEntityGroups(Alert $alert, Collection $users): Collection
    {
        try {
            $entity = $alert->alertable;
            
            if (!$entity || !$entity->group_id) {
                return $users; // Si pas de groupes, tous les utilisateurs du tenant
            }

            // Get the entity's group (singular relationship)
            $entityGroup = $entity->group;
            $entityGroupIds = $entityGroup ? [$entityGroup->id] : [];
            
            if (empty($entityGroupIds)) {
                return $users; // Si entité sans groupe, tous les utilisateurs
            }

            return $users->filter(function ($user) use ($entityGroupIds) {
                // Utilisateurs sans restriction de groupe voient tout
                if ($user->groups()->count() === 0) {
                    return true;
                }
                
                // Vérifier si l'utilisateur a accès à au moins un groupe de l'entité
                $userGroupIds = $user->groups()->pluck('groups.id')->toArray();
                return !empty(array_intersect($userGroupIds, $entityGroupIds));
            });

        } catch (\Exception $e) {
            Log::error('Error filtering users by entity groups', [
                'alert_id' => $alert->id,
                'error' => $e->getMessage()
            ]);
            return $users; // En cas d'erreur, retourner tous les utilisateurs
        }
    }

    /**
     * Assigner l'alerte aux utilisateurs éligibles
     */
    public function assignAlertToUsers(Alert $alert, Collection $users): void
    {
        $assignments = $users->map(function ($user) {
            return [
                'user_id' => $user->id,
                'read_at' => null, // Non lu par défaut
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        if (!empty($assignments)) {
            $alert->users()->attach($assignments);
        }
    }

    public function getValidationMessages(): array
    {
        return [
            'title.required' => __('alerts.validation.title.required'),
            'title.max' => __('alerts.validation.title.max'),
            'type.required' => __('alerts.validation.type.required'),
            'severity.required' => __('alerts.validation.severity.required'),
            'severity.in' => __('alerts.validation.severity.in'),
            'alertable_type.required' => __('alerts.validation.alertable_type.required'),
            'alertable_id.required' => __('alerts.validation.alertable_id.required'),
            'expires_at.after' => __('alerts.validation.expires_at.after'),
        ];
    }

    public function asController(ActionRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        
        // Set tenant_id if user is tenant-based and not explicitly set
        if ($request->user()->tenant_id && !isset($data['tenant_id'])) {
            $data['tenant_id'] = $request->user()->tenant_id;
        }

        $alert = $this->handle($data);

        return to_route('alerts.show', $alert)
            ->with('success', __('alerts.created'));
    }
} 