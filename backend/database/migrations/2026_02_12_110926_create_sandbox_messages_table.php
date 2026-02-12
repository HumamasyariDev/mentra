<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sandbox_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sandbox_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant']);
            $table->text('content');
            $table->timestamps();

            $table->index(['sandbox_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sandbox_messages');
    }
};
