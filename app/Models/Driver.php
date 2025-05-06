<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Driver extends Model
{
    use HasFactory, BelongsToTenant, HasUuids, SoftDeletes;

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

}
