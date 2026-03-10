<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')
                  ->unique()                  // one quiz per task
                  ->constrained('tasks')
                  ->onDelete('cascade');
            // JSONB for Postgres/Supabase — stores array of question objects
            $table->jsonb('questions');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
