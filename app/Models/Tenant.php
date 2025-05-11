<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Laravel\Scout\Searchable;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasFactory, SoftDeletes, HasDatabase, HasDomains, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'address',
        'email',
        'phone',
        'is_active',
        'svg_logo',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

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
            'address' => (string) $this->address,
            'phone' => (string) $this->phone,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
            '__soft_deleted' => (bool) $this->trashed(),
        ];

        return $array;
    }

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'address',
            'phone',
            'is_active',
            'svg_logo',
            'deleted_at',
            'created_at',
            'updated_at',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}