<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->timestamp('next_water_at')->nullable()->after('last_watered_at');
        });
    }

    public function down(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->dropColumn('next_water_at');
        });
    }
};
