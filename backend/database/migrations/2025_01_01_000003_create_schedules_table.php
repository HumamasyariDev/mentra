<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['daily', 'weekly', 'monthly'])->default('daily');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->json('days_of_week')->nullable();
            $table->integer('day_of_month')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('exp_reward')->default(5);
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'is_active']);
        });

        Schema::create('schedule_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('completed_date');
            $table->timestamps();

            $table->unique(['schedule_id', 'completed_date']);
            $table->index(['user_id', 'completed_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_completions');
        Schema::dropIfExists('schedules');
    }
};
