<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;
use Laravel\Scout\Searchable;

class Driver extends Model
{
    use HasFactory, BelongsToTenant, HasUuids, SoftDeletes, Searchable;

    protected $fillable = [
        'surname',
        'firstname',
        'tenant_id',
        'phone',
        'user_id',
        'card_issuing_country',
        'card_number',
        'license_number',
        'birthdate',
        'card_issuing_date',
        'card_expiration_date',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'card_issuing_date' => 'date',
        'card_expiration_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
            'tenant_id' => (string) $this->tenant_id,
            'firstname' => (string) $this->firstname,
            'surname' => (string) $this->surname,
            'full_name' => (string) ($this->firstname . ' ' . $this->surname),
            'phone' => (string) $this->phone,
            'license_number' => (string) $this->license_number,
            'card_number' => (string) $this->card_number,
            'tenant_name' => (string) $this->tenant?->name,
            'created_at' => $this->created_at ? (int) $this->created_at->timestamp : null,
            '__soft_deleted' => (bool) $this->trashed(),
        ];

        return $array;
    }

    /**
     * Modify the query used to retrieve models when making all models searchable.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->with(['tenant', 'user']);
    }
}
