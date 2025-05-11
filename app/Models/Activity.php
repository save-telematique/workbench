<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    const REMOVED_CARD = 100;
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'parent_id',
    ];

    public function parent()
    {
        return $this->belongsTo(Activity::class, 'parent_id');
    }

    public function childrens()
    {
        return $this->hasMany(Activity::class, 'parent_id');
    }
}
