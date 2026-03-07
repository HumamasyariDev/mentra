<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * EmbeddingService
 *
 * Converts text into a 384-dimensional sentence embedding vector using
 * HuggingFace's Router API with the BAAI/bge-small-en-v1.5 model.
 *
 * NOTE: HuggingFace deprecated api-inference.huggingface.co (returns 410).
 * The correct endpoint is now router.huggingface.co (returns 200 ✅).
 *
 * Endpoint: POST https://router.huggingface.co/hf-inference/models/{model}/pipeline/feature-extraction
 * Response: float[384] — flat 1D array, ready to use directly as pgvector
 *
 * Usage:
 *   $embedding = app(EmbeddingService::class)->embed("hello world");
 *   // returns float[384], or null on failure
 */
class EmbeddingService
{
    private string $apiKey;
    private string $model;

    // ✅ Correct HuggingFace Router API (replaces deprecated api-inference.huggingface.co)
    private const ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/%s/pipeline/feature-extraction';

    public function __construct()
    {
        $this->apiKey = config('services.huggingface.key', '');
        $this->model = config('services.huggingface.embedding_model', 'BAAI/bge-small-en-v1.5');
    }

    /**
     * Embed a single text string into a 384-dimensional float vector.
     *
     * @param  string     $text  The sentence/phrase to embed.
     * @return float[]|null      384-dim array, or null on failure.
     */
    public function embed(string $text): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('EmbeddingService: HUGGINGFACE_API_KEY is not set in .env');
            return null;
        }

        $url = sprintf(self::ROUTER_URL, $this->model);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($url, [
                        'inputs' => $text,
                        'options' => [
                            'wait_for_model' => true,
                            'use_cache' => true,
                        ],
                    ]);

            if ($response->failed()) {
                Log::error('EmbeddingService: API call failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => $url,
                ]);
                return null;
            }

            $data = $response->json();

            return $this->extractEmbedding($data, $text);

        } catch (\Exception $e) {
            Log::error('EmbeddingService: Exception.', [
                'message' => $e->getMessage(),
                'url' => $url,
            ]);
            return null;
        }
    }

    /**
     * Parse HuggingFace Router API response.
     *
     * The router endpoint for feature-extraction returns:
     *   - float[384]   — flat 1D array (most common, BAAI/bge-small-en-v1.5)
     *   - float[n][384] — 2D token-level array (some models, needs mean pool)
     *   - float[b][n][384] — 3D batched (needs mean pool of first batch item)
     *
     * @param  mixed  $data  Raw JSON response
     * @param  string $text  Original text (for log context)
     * @return float[]|null
     */
    private function extractEmbedding(mixed $data, string $text): ?array
    {
        if (!is_array($data) || empty($data)) {
            Log::warning('EmbeddingService: Empty or non-array response.', [
                'data' => $data,
                'text' => substr($text, 0, 80),
            ]);
            return null;
        }

        // CASE 1: Flat 1D — float[384] — router returns this for BAAI/bge-small-en-v1.5
        if (is_float($data[0]) || is_int($data[0])) {
            return array_map('floatval', $data);
        }

        // CASE 2: 2D token-level — float[num_tokens][384]
        if (is_array($data[0]) && isset($data[0][0]) && (is_float($data[0][0]) || is_int($data[0][0]))) {
            return $this->meanPool($data);
        }

        // CASE 3: 3D batched — float[1][num_tokens][384]
        if (is_array($data[0]) && isset($data[0][0]) && is_array($data[0][0])) {
            return $this->meanPool($data[0]);
        }

        Log::warning('EmbeddingService: Could not determine response structure.', [
            'top_level_count' => count($data),
            'd0_type' => gettype($data[0]),
            'text' => substr($text, 0, 80),
        ]);

        return null;
    }

    /**
     * Mean pool token embeddings into a single sentence embedding.
     *
     * @param  float[][] $tokenEmbeddings   2D array [num_tokens × dim]
     * @return float[]                      1D array [dim]
     */
    private function meanPool(array $tokenEmbeddings): array
    {
        $numTokens = count($tokenEmbeddings);

        if ($numTokens === 0) {
            return [];
        }

        $dim = count($tokenEmbeddings[0]);
        $sum = array_fill(0, $dim, 0.0);

        foreach ($tokenEmbeddings as $tokenVec) {
            for ($i = 0; $i < $dim; $i++) {
                $sum[$i] += (float) ($tokenVec[$i] ?? 0.0);
            }
        }

        return array_map(fn($v) => $v / $numTokens, $sum);
    }

    /**
     * Convert a float[] embedding to a safe pgvector literal string.
     * e.g. [0.12, 0.34, ...] => '[0.12,0.34,...]'
     *
     * @param  float[]  $embedding
     * @return string
     */
    public function toVectorString(array $embedding): string
    {
        $sanitized = array_map('floatval', $embedding);
        return '[' . implode(',', $sanitized) . ']';
    }
}
