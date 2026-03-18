<?php

namespace Database\Seeders;

use App\Models\TreeType;
use Illuminate\Database\Seeder;

class TreeTypeSeeder extends Seeder
{
    public function run(): void
    {
        TreeType::create([
            'name' => 'pine_purple',
            'display_name' => 'Purple Pine',
            // Incremental costs per stage: seed->1, 1->2, 2->3, 3->4, 4->final
            // Cumulative: 5, 15, 30, 50, 75 total cans
            'stage_costs' => [5, 10, 15, 20, 25],
        ]);
    }
}
