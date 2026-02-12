<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ExpLog extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'source',
        'description',
        'sourceable_type',
        'sourceable_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceable(): MorphTo
    {
        return $this->morphTo();
    }
}
