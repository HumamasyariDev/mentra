<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop channel_id from forum_messages if it still exists
        if (Schema::hasColumn('forum_messages', 'channel_id')) {
            Schema::table('forum_messages', function (Blueprint $table) {
                // Drop FK first if it exists (ignore errors)
                try {
                    $table->dropForeign(['channel_id']);
                } catch (\Exception $e) {
                    // FK may not exist
                }
                $table->dropColumn('channel_id');
            });
        }

        Schema::dropIfExists('channels');
        Schema::dropIfExists('forums');
    }

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
            $table->string('type')->default('text');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Re-add channel_id to forum_messages
        Schema::table('forum_messages', function (Blueprint $table) {
            $table->foreignId('channel_id')->after('id')->constrained()->onDelete('cascade');
        });
    }
};
