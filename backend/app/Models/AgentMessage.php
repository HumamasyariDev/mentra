<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentMessage extends Model
{
    protected $fillable = [
        'chat_session_id',
        'role',
        'content',
        'type',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class);
    }
}
