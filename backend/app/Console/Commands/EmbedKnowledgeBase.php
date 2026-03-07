<?php

namespace App\Console\Commands;

use App\Models\KnowledgeBase;
use App\Services\EmbeddingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * php artisan knowledge:embed
 *
 * Generates or re-generates vector embeddings for all knowledge_base
 * entries that are missing an embedding.
 *
 * Useful after:
 *   - Seeding without a HuggingFace API key
 *   - Bulk-inserting entries via SQL
 *   - Changing embedding model
 *
 * Options:
 *   --all     Re-generate embeddings for ALL entries, even those that already have one
 *   --limit=N Process at most N entries (default: all)
 */
class EmbedKnowledgeBase extends Command
{
    protected $signature = 'knowledge:embed {--all : Re-embed all entries, even those with existing embeddings} {--limit=0 : Limit number of entries to process}';
    protected $description = 'Generate vector embeddings for knowledge_base entries';

    public function handle(EmbeddingService $embeddingService): int
    {
        $embedAll = $this->option('all');
        $limit = (int) $this->option('limit');

        $query = KnowledgeBase::query();

        if (!$embedAll) {
            // Only process entries without embeddings
            $query->whereRaw('embedding IS NULL');
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        $total = $query->count();
        $success = 0;
        $failed = 0;

        if ($total === 0) {
            $this->info('No entries to process.' . ($embedAll ? '' : ' All entries already have embeddings.'));
            return self::SUCCESS;
        }

        $this->info("Processing {$total} knowledge base entries…");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $query->chunk(10, function ($entries) use ($embeddingService, &$success, &$failed, $bar) {
            foreach ($entries as $entry) {
                $embedding = $embeddingService->embed($entry->content);

                if ($embedding) {
                    $vectorStr = $embeddingService->toVectorString($embedding);
                    DB::statement(
                        'UPDATE knowledge_base SET embedding = CAST(? AS vector) WHERE id = ?',
                        [$vectorStr, $entry->id]
                    );
                    $success++;
                } else {
                    $failed++;
                }

                $bar->advance();

                // Small delay to avoid HuggingFace rate limiting
                usleep(200000); // 200ms
            }
        });

        $bar->finish();
        $this->newLine(2);

        $this->info("Embedded: {$success} entries");

        if ($failed > 0) {
            $this->warn("Failed: {$failed} entries. Check HUGGINGFACE_API_KEY and retry.");
        }

        return self::SUCCESS;
    }
}
