<?php

namespace App\Actions\Alerts;

use App\Models\Alert;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class GetAlertsAction
{
    use AsAction;

    public function handle(
        ?Model $entity = null,
        ?User $user = null,
        array $filters = [],
        int $perPage = 15
    ): LengthAwarePaginator {
        $user = $user ?? Auth::user();
        
        if (!$user) {
            throw new \Exception('User not authenticated');
        }
        
        $query = Alert::query()
            ->with(['alertable', 'creator'])
            ->active()
            ->whereHas('users', function (Builder $userQuery) use ($user) {
                $userQuery->where('user_id', $user->id);
            });

        // Apply entity filtering if provided
        if ($entity) {
            $query->where('alertable_type', get_class($entity))
                  ->where('alertable_id', $entity->getKey());
        }

        // Apply additional filters
        $this->applyFilters($query, $filters);

        // Apply user-specific read status if requested
        if (isset($filters['status']) && in_array($filters['status'], ['read', 'unread'])) {
            $this->applyReadStatusFilter($query, $user, $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }

    public function authorize(ActionRequest $request, ?Model $entity = null): bool
    {
        $user = $request->user();
        
        // Check basic permission to view alerts
        if (!$user->can('view_alerts')) {
            return false;
        }

        // If entity is provided, check if user can view that specific entity
        if ($entity) {
            // Check if user can view the entity itself
            if (!$user->can('view', $entity)) {
                return false;
            }

            // For tenant users, ensure entity belongs to their tenant
            if ($user->tenant_id && method_exists($entity, 'tenant') && $entity->tenant_id !== $user->tenant_id) {
                return false;
            }
        }

        return true;
    }



    /**
     * Apply additional filters to the query
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $searchQuery) use ($search) {
                $searchQuery->where('title', 'ILIKE', "%{$search}%")
                           ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }

        // Severity filter
        if (!empty($filters['severity']) && $filters['severity'] !== 'all') {
            $query->where('severity', $filters['severity']);
        }

        // Type filter
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        // Alertable type filter
        if (!empty($filters['alertable_type'])) {
            $query->where('alertable_type', $filters['alertable_type']);
        }

        // Date range filters
        if (!empty($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }
    }

    /**
     * Apply read status filter for the specific user
     */
    protected function applyReadStatusFilter(Builder $query, User $user, string $status): void
    {
        if ($status === 'read') {
            $query->whereHas('users', function (Builder $userQuery) use ($user) {
                $userQuery->where('user_id', $user->id)
                         ->whereNotNull('read_at');
            });
        } elseif ($status === 'unread') {
            $query->whereHas('users', function (Builder $userQuery) use ($user) {
                $userQuery->where('user_id', $user->id)
                         ->whereNull('read_at');
            });
        }
    }

    public function asController(ActionRequest $request)
    {
        $filters = $request->only([
            'search', 'severity', 'status', 'type', 'alertable_type', 
            'from_date', 'to_date'
        ]);

        $perPage = (int) $request->get('per_page', 15);
        $perPage = min($perPage, 100); // Cap at 100 items per page

        $alerts = $this->handle(
            entity: null,
            user: $request->user(),
            filters: $filters,
            perPage: $perPage
        );

        return $alerts;
    }
} 