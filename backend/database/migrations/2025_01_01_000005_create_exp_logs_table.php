<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('amount');
            $table->enum('source', ['task', 'pomodoro', 'schedule', 'streak', 'bonus']);
            $table->string('description')->nullable();
            $table->morphs('sourceable');
            $table->timestamps();

            $table->index(['user_id', 'source']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exp_logs');
    }
};
