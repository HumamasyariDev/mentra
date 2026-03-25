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
        if (Schema::hasColumn('forum_messages', 'channel_id')) {
            Schema::table('forum_messages', function (Blueprint $table) {
                // Drop foreign key if it exists
                try {
                    $table->dropForeign(['channel_id']);
                } catch (\Exception $e) {
                    // Ignore if foreign key doesn't exist
                }
                $table->unsignedBigInteger('channel_id')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('forum_messages', 'channel_id')) {
            Schema::table('forum_messages', function (Blueprint $table) {
                $table->unsignedBigInteger('channel_id')->nullable(false)->change();
            });
        }
    }
};
