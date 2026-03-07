<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Knowledge base table for RAG (Retrieval-Augmented Generation).
     * Stores text content alongside its vector embedding for semantic search.
     * Uses pgvector's vector(384) type matching BAAI/bge-small-en-v1.5 output.
     */
    public function up(): void
    {
        Schema::create('knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('content');
            $table->jsonb('metadata')->default('{}');
            $table->string('source')->nullable()->comment('e.g. user_note, system, task_description');
            $table->timestamps();
        });

        // Add the vector column using raw SQL (Laravel Blueprint doesn't support pgvector natively)
        DB::statement('ALTER TABLE knowledge_base ADD COLUMN embedding vector(384)');

        // Create an HNSW index for fast approximate cosine similarity search
        DB::statement('CREATE INDEX knowledge_base_embedding_hnsw_idx ON knowledge_base USING hnsw (embedding vector_cosine_ops)');
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_base');
    }
};
