<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add type to tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('type', 10)->default('normal')->after('user_id'); // 'normal' | 'quiz'
            $table->index(['user_id', 'type']);
        });

        // Add material to quizzes
        Schema::table('quizzes', function (Blueprint $table) {
            $table->text('material')->nullable()->after('questions');
        });

        // Create quiz_attempts table
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('score'); // number of correct answers
            $table->integer('total'); // total questions
            $table->jsonb('answers')->nullable(); // { questionIndex: selectedOptionIndex }
            $table->timestamps();

            $table->index(['quiz_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('material');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type']);
            $table->dropColumn('type');
        });
    }
};
