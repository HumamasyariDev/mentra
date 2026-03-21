<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TreeType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'stage_costs',
    ];

    protected $casts = [
        'stage_costs' => 'array',
    ];

    public function trees(): HasMany
    {
        return $this->hasMany(Tree::class);
    }

    /**
     * Get the incremental cost for a specific stage (1-4).
     * Stage 5 (final) has no cost as it's the last stage.
     * stage_costs array indexed 0-4 corresponds to stages 1-5.
     */
    public function getCostForStage(int $stage): int
    {
        // Convert stage (1-5) to array index (0-4)
        $index = $stage - 1;
        if ($index < 0 || $index >= count($this->stage_costs)) {
            return 0;
        }
        return $this->stage_costs[$index] ?? 0;
    }

    /**
     * Get the cumulative total cans needed to reach a stage.
     * e.g., if stage_costs = [5, 10, 15, 20, 25]:
     *   Stage 1 (plant): 5 total
     *   Stage 2 (1->2): 15 total
     *   Stage 3 (2->3): 30 total
     *   Stage 4 (3->4): 50 total
     *   Stage 5 (4->final): 75 total
     */
    public function getCumulativeCost(int $stage): int
    {
        $index = $stage - 1;
        if ($index < 0) {
            return 0;
        }
        return array_sum(array_slice($this->stage_costs, 0, min($index + 1, count($this->stage_costs))));
    }
}
