<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agent_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_session_id')->constrained()->onDelete('cascade');
            $table->string('role'); // 'user', 'agent', 'error'
            $table->text('content');
            $table->string('type')->default('text'); // 'text', 'task_created', 'error'
            $table->json('metadata')->nullable(); // for storing task data, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_messages');
    }
};
