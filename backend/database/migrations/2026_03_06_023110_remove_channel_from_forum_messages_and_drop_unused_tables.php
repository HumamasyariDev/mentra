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
        // Remove channel_id from forum_messages
        Schema::table('forum_messages', function (Blueprint $table) {
            $table->dropForeign(['channel_id']);
            $table->dropColumn('channel_id');
        });

        // Drop unused tables
        Schema::dropIfExists('channels');
        Schema::dropIfExists('forums');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate forums table
        Schema::create('forums', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Recreate channels table
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('forum_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['text', 'voice'])->default('text');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Add channel_id back to forum_messages
        Schema::table('forum_messages', function (Blueprint $table) {
            $table->foreignId('channel_id')->nullable()->constrained()->onDelete('cascade');
        });
    }
};
