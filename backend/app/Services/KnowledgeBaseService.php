<?php

namespace App\Services;

use App\Models\KnowledgeBase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * KnowledgeBaseService
 *
 * Centralizes all CRUD + embedding logic for the knowledge_base table.
 * Used by AgentController and the KnowledgeBaseSeeder.
 */
class KnowledgeBaseService
{
    public function __construct(
        private EmbeddingService $embeddingService,
    ) {
    }

    /**
     * Store a new knowledge entry and generate its vector embedding.
     *
     * @param  string       $content   The text to store
     * @param  string       $source    Label: 'user_note', 'system', 'task_description', etc.
     * @param  array        $metadata  Any extra JSON metadata
     * @param  int|null     $userId    null = global/system entry, userId = user-specific
     * @return KnowledgeBase
     */
    public function store(
        string $content,
        string $source = 'system',
        array $metadata = [],
        ?int $userId = null
    ): KnowledgeBase {
        $entry = KnowledgeBase::create([
            'user_id' => $userId,
            'content' => $content,
            'source' => $source,
            'metadata' => $metadata,
        ]);

        $this->generateEmbedding($entry);

        return $entry;
    }

    /**
     * Regenerate the embedding for an existing entry.
     *
     * @param  KnowledgeBase $entry
     * @return bool  true if embedding was generated, false if it failed
     */
    public function generateEmbedding(KnowledgeBase $entry): bool
    {
        $embedding = $this->embeddingService->embed($entry->content);

        if (!$embedding) {
            Log::warning("KnowledgeBaseService: Embedding generation failed for entry #{$entry->id}");
            return false;
        }

        $vectorStr = $this->embeddingService->toVectorString($embedding);

        DB::statement(
            'UPDATE knowledge_base SET embedding = CAST(? AS vector) WHERE id = ?',
            [$vectorStr, $entry->id]
        );

        return true;
    }

    /**
     * Perform cosine similarity search using pgvector.
     *
     * @param  string   $query      Natural language query
     * @param  int|null $userId     Search scope: null = global only, int = global + user entries
     * @param  int      $limit      Max results to return
     * @return array    [{ id, content, source, metadata, similarity }]
     */
    public function search(string $query, ?int $userId = null, int $limit = 3): array
    {
        $embedding = $this->embeddingService->embed($query);

        if (!$embedding) {
            // Fallback: return most recent entries
            return KnowledgeBase::where(function ($q) use ($userId) {
                $q->whereNull('user_id');
                if ($userId) {
                    $q->orWhere('user_id', $userId);
                }
            })
                ->whereNotNull('embedding')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get(['id', 'content', 'source', 'metadata'])
                ->toArray();
        }

        $vectorStr = $this->embeddingService->toVectorString($embedding);

        $userCondition = $userId
            ? "AND (user_id IS NULL OR user_id = {$userId})"
            : "AND user_id IS NULL";

        return DB::select("
            SELECT
                id,
                content,
                source,
                metadata,
                ROUND(CAST(1 - (embedding <=> CAST(? AS vector)) AS NUMERIC), 4) AS similarity
            FROM knowledge_base
            WHERE embedding IS NOT NULL
              {$userCondition}
            ORDER BY embedding <=> CAST(? AS vector)
            LIMIT ?
        ", [$vectorStr, $vectorStr, $limit]);
    }
}
