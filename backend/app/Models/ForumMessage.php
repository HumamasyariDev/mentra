<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForumMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel_id',
        'user_id',
        'title',
        'content',
        'reply_to_id',
        'is_edited',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(ForumMessage::class, 'reply_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ForumMessage::class, 'reply_to_id');
    }
}
