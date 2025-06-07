<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, Searchable, HasRoles, BelongsToTenant;

    protected $with = ['tenant'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'locale',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        $array = [
            'id' => (string) $this->id,
            'name' => (string) $this->name,
            'email' => (string) $this->email,
            'tenant_name' => (string) $this->tenant?->name,
            'tenant_id' => (string) $this->tenant?->id,
            'tenant_id_null' => (bool) $this->tenant ? false : true,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
        ];

        return $array;
    }

    /**
     * Modify the query used to retrieve models when making all models searchable.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with('tenant');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * The groups this user has access to
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'user_groups');
    }

    /**
     * Get all group IDs this user has access to (including descendants)
     */
    public function getAccessibleGroupIds(): array
    {
        $groupIds = [];
        
        foreach ($this->groups as $group) {
            $groupIds = array_merge($groupIds, $group->getAllDescendantIds());
        }
        
        return array_unique($groupIds);
    }

    /**
     * Check if user has access to a specific group
     */
    public function hasAccessToGroup(Group $group): bool
    {
        return in_array($group->id, $this->getAccessibleGroupIds());
    }

    /**
     * Check if user can access resources of a specific group (or groupless resources)
     */
    public function canAccessResourceGroup($groupId): bool
    {
        // Always can access groupless resources (null group_id)
        if (is_null($groupId)) {
            return true;
        }
        
        return in_array($groupId, $this->getAccessibleGroupIds());
    }
}
