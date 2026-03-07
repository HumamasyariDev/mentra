<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeBase;
use App\Services\EmbeddingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * AgentController
 *
 * Provides tool endpoints for the LangChain.js ReAct Agent running in the frontend.
 * Each endpoint corresponds to a DynamicTool defined in MentraTools.js.
 *
 * All routes are protected by auth:sanctum.
 *
 * Endpoints:
 *   POST /api/agent/vector-search   -> search_knowledge tool
 *   POST /api/agent/tasks           -> create_task tool
 *   POST /api/agent/knowledge       -> add_knowledge utility
 */
class AgentController extends Controller
{
    public function __construct(
        private EmbeddingService $embeddingService,
    ) {
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tool: search_knowledge
    // POST /api/agent/vector-search
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Embeds the incoming query using HuggingFace and performs a cosine
     * similarity search against the knowledge_base table using pgvector.
     *
     * Input:  { "query": "how to stay focused?", "limit": 3 }
     * Output: { "context": "...", "results": [...], "query": "..." }
     */
    public function vectorSearch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'max:1000'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $query = $validated['query'];
        $limit = $validated['limit'] ?? 3;
        $userId = $request->user()->id;

        // Generate embedding for the search query
        $embedding = $this->embeddingService->embed($query);

        if (!$embedding) {
            // Graceful fallback: return most recent entries when embedding is unavailable
            $fallback = KnowledgeBase::where(function ($q) use ($userId) {
                $q->whereNull('user_id')->orWhere('user_id', $userId);
            })
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->pluck('content');

            return response()->json([
                'context' => $fallback->implode("\n\n") ?: 'No context available.',
                'results' => $fallback->values(),
                'query' => $query,
                'note' => 'Embedding unavailable (check HUGGINGFACE_API_KEY). Returning recent entries as fallback.',
            ]);
        }

        // Safe parameterized vector query using pgvector <=> (cosine distance)
        // The vector literal is cast via ::vector inside the SQL.
        // We use a placeholder for the user_id but must inline the vector string
        // since PDO cannot bind custom types like vector — we sanitize by
        // ensuring the array only contains floats before converting.
        $vectorStr = $this->buildSafeVectorString($embedding);

        $results = DB::select("
            SELECT
                id,
                content,
                source,
                metadata,
                ROUND(CAST(1 - (embedding <=> CAST(? AS vector)) AS NUMERIC), 4) AS similarity
            FROM knowledge_base
            WHERE (user_id IS NULL OR user_id = ?)
              AND embedding IS NOT NULL
            ORDER BY embedding <=> CAST(? AS vector)
            LIMIT ?
        ", [$vectorStr, $userId, $vectorStr, $limit]);

        $context = collect($results)->pluck('content')->implode("\n\n");

        return response()->json([
            'context' => $context ?: 'No relevant knowledge found.',
            'results' => $results,
            'query' => $query,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tool: create_task
    // POST /api/agent/tasks
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new task for the authenticated user.
     * Returns the created task with XP info so the agent can confirm to the user.
     *
     * Input:
     * {
     *   "title":       "Learn pgvector",   (required)
     *   "description": "...",              (optional)
     *   "priority":    "high",             (optional: low|medium|high)
     *   "due_date":    "2026-03-14",       (optional: YYYY-MM-DD)
     *   "exp_reward":  30                  (optional: 1-100)
     * }
     *
     * Output: { "task": {...}, "message": "...", "xp_reward": 30 }
     */
    public function createTask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'due_date' => ['nullable', 'date'],
            'exp_reward' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $task = $request->user()->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'due_date' => $validated['due_date'] ?? null,
            'exp_reward' => $validated['exp_reward'] ?? 10,
            'status' => 'pending',
        ]);

        return response()->json([
            'task' => $task,
            'message' => "Task '{$task->title}' berhasil dibuat! Selesaikan untuk mendapatkan +{$task->exp_reward} XP.",
            'xp_reward' => $task->exp_reward,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utility: add_knowledge
    // POST /api/agent/knowledge
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Adds a new entry to the knowledge base with automatic embedding.
     *
     * Input:  { "content": "...", "source": "user_note", "metadata": {} }
     * Output: { "id": 1, "message": "...", "embedding_ready": true }
     */
    public function addKnowledge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'source' => ['nullable', 'string', 'max:100'],
            'metadata' => ['nullable', 'array'],
        ]);

        $entry = KnowledgeBase::create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'source' => $validated['source'] ?? 'user_note',
            'metadata' => $validated['metadata'] ?? [],
        ]);

        $embeddingReady = false;
        $embedding = $this->embeddingService->embed($validated['content']);

        if ($embedding) {
            $vectorStr = $this->buildSafeVectorString($embedding);
            DB::statement(
                'UPDATE knowledge_base SET embedding = CAST(? AS vector) WHERE id = ?',
                [$vectorStr, $entry->id]
            );
            $embeddingReady = true;
        } else {
            Log::warning("AgentController: Embedding failed for knowledge_base entry #{$entry->id}");
        }

        return response()->json([
            'id' => $entry->id,
            'message' => $embeddingReady
                ? "Knowledge entry saved with embedding. It's now searchable via vector-search."
                : "Knowledge entry saved without embedding (check HUGGINGFACE_API_KEY). Not yet searchable.",
            'embedding_ready' => $embeddingReady,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Convert a float[] embedding to a safe pgvector literal string.
     *
     * Security: we enforce all values are floats before joining,
     * preventing any string injection through the embedding array.
     *
     * @param  float[]  $embedding
     * @return string   e.g. "[0.12,0.34,...]"
     */
    private function buildSafeVectorString(array $embedding): string
    {
        $sanitized = array_map(fn($v) => (float) $v, $embedding);
        return '[' . implode(',', $sanitized) . ']';
    }
}
