<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tree_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // e.g., "pine_purple"
            $table->string('display_name');   // e.g., "Purple Pine"
            $table->json('stage_costs');      // [5, 10, 15, 20, 25] (incremental costs per stage)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tree_types');
    }
};
