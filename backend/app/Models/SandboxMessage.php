<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SandboxMessage extends Model
{
    protected $fillable = [
        'sandbox_id',
        'role',
        'content',
    ];

    public function sandbox(): BelongsTo
    {
        return $this->belongsTo(Sandbox::class);
    }
}
