<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class KnowledgeBase extends Model
{
    use HasFactory;

    protected $table = 'knowledge_base';

    protected $fillable = [
        'user_id',
        'content',
        'metadata',
        'source',
        // 'embedding' is handled via raw SQL, not mass-assignment
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Note: 'embedding' vector column is not in $fillable.
    // Use raw DB queries or updateEmbedding() to set it.

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Set the embedding column via a raw SQL update.
     * pgvector requires the vector literal format: '[0.1,0.2,...]'
     *
     * @param float[] $embedding
     * @return void
     */
    public function updateEmbedding(array $embedding): void
    {
        $vectorStr = '[' . implode(',', $embedding) . ']';
        \Illuminate\Support\Facades\DB::table($this->table)
            ->where('id', $this->id)
            ->update(['embedding' => DB::raw("'{$vectorStr}'::vector")]);
    }
}
