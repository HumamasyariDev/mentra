<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Enable the pgvector extension in Supabase/PostgreSQL.
     * This must run BEFORE any migration that uses vector() column type.
     * Skipped for MySQL databases.
     */
    public function up(): void
    {
        // Only run on PostgreSQL
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
        }
    }

    public function down(): void
    {
        // Intentionally left blank — dropping vector extension could break other tables.
        // DB::statement('DROP EXTENSION IF EXISTS vector');
    }
};
