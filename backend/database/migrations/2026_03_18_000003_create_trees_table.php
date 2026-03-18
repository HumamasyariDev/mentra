<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('tree_type_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('stage')->default(0);  // 0=seed, 1-4=stages, 5=final
            $table->unsignedInteger('water_progress')->default(0);  // Progress toward next stage
            $table->boolean('is_active')->default(true);  // Active (spotlight) vs archived (forest)
            $table->boolean('is_withered')->default(false);
            $table->boolean('is_permanent')->default(false);  // True after 10 archive waterings
            $table->unsignedTinyInteger('archive_waterings')->default(0);  // 0-10, for archived trees
            $table->timestamp('last_watered_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trees');
    }
};
